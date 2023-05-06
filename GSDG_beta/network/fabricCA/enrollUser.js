const { Wallets, X509Identity } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const fs = require('fs');
const path = require('path');
require('dotenv').config()


const ccpPath = process.env.CCP_PATH
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

async function enrollUser(userId, secret) {
    try {
        const caURL = ccp.certificateAuthorities['ca.example.com'].url;
        const ca = new FabricCAServices(caURL);

        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        const userExists = await wallet.get(userId);
        if (userExists) {
            console.log(`An identity for the user "${userId}" already exists in the wallet.`);
            return;
        }

        const enrollment = await ca.enroll({ enrollmentID: userId, enrollmentSecret: secret });
        const identity = X509Identity.fromX509CertificateAndPrivateKey(enrollment.certificate, enrollment.key.toBytes());
        await wallet.put(userId, identity);
        console.log(`Successfully enrolled user "${userId}" and imported it into the wallet.`);
    } catch (error) {
        console.error(`Failed to enroll user "${userId}": ${error}`);
    }
}

async function enrollAdmin() {
    try {
        const caInfo = ccp.certificateAuthorities['ca.example.com'];
        const caTLSCACerts = caInfo.tlsCACerts.pem;
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        const adminExists = await wallet.get('admin');
        if (adminExists) {
            console.log('An identity for the admin user "admin" already exists in the wallet');
            return;
        }

        const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
        const identity = X509Identity.fromX509CertificateAndPrivateKey(enrollment.certificate, enrollment.key.toBytes());
        await wallet.put('admin', identity);
        console.log('Successfully enrolled admin user "admin" and imported it into the wallet');
    } catch (error) {
        console.error(`Failed to enroll admin user "admin": ${error}`);
    }
}

async function registerUser(userId, adminIdentity) {
    try {
        const caURL = ccp.certificateAuthorities['ca.example.com'].url;
        const ca = new FabricCAServices(caURL);

        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        const userExists = await wallet.get(userId);
        if (userExists) {
            console.log(`An identity for the user "${userId}" already exists in the wallet.`);
            return;
        }

        // Load the admin identity from the wallet and use it to register the new user
        const adminUser = await wallet.get(adminIdentity);
        if (!adminUser) {
            console.log(`Admin user "${adminIdentity}" does not exist in the wallet.`);
            return;
        }
        const provider = wallet.getProviderRegistry().getProvider(adminUser.type);
        const adminUserContext = await provider.getUserContext(adminUser, 'admin');

        const secret = await ca.register({
            enrollmentID: userId,
            role: 'client',
            affiliation: 'org1.department1'
        }, adminUserContext);

        console.log(`Successfully registered user "${userId}" with enrollment secret "${secret}".`);
        return secret;
    } catch (error) {
        console.error(`Failed to register user "${userId}": ${error}`);
    }
}

async function main() {
    await enrollAdmin();
    
    const userId = process.env.USER_ID;
    const secret = await registerUser(userId, 'admin');
    
    if (secret) {
        await enrollUser(userId, secret);
    }
}

main();

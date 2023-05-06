FROM hyperledger/fabric-ccenv:latest
WORKDIR /chaincode/
COPY . .
CMD ["sh", "-c", "go run write_chain.go"]

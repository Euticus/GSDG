package main

import (
	"encoding/json"
	"fmt"
	"strconv"
	"time"

	"github.com/hyperledger/fabric-chaincode-go/pkg/shim"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
	"github.com/hyperledger/fabric-protos-go/peer"
)

type WriteChain struct {
	contractapi.Contract
}

type Data struct {
	ID   string `json:"id"`
	Data string `json:"data"`
}

func (wc *WriteChain) InitLedger(ctx contractapi.TransactionContextInterface) error {
	return nil
}

func (wc *WriteChain) WriteData(ctx contractapi.TransactionContextInterface, id string, data string) error {
	dataObj := Data{
		ID:   id,
		Data: data,
	}
	dataAsBytes, err := json.Marshal(dataObj)
	if err != nil {
		return err
	}
	err = ctx.GetStub().PutState(id, dataAsBytes)
	if err != nil {
		return err
	}

	// Invoke side-chain's chaincode to store metadata
	// ...

	// Invoke side-chain's chaincode to store metadata
	sideChainFunction := "StoreMetadata"
	sideChainChannel := "sidechainchannel" // Replace this with the actual side-chain channel name

	chaincodeInvocation := &peer.ChaincodeInvocationSpec{
		ChaincodeSpec: &peer.ChaincodeSpec{
			Type: peer.ChaincodeSpec_GOLANG,
			ChaincodeId: &peer.ChaincodeID{
				Name: "sidechain", // Replace this with the actual side-chain chaincode name
			},
			Input: &peer.ChaincodeInput{
				Args: [][]byte{
					[]byte(sideChainFunction),
					[]byte(id),
					[]byte("writeChain"),
					[]byte(id),
					[]byte(strconv.FormatInt(time.Now().Unix(), 10)),
				},
			},
		},
	}

	response := ctx.GetStub().InvokeChaincode(sideChainChannel, chaincodeInvocation.GetChaincodeSpec().GetInput().GetArgs(), "")

	if response.Status != shim.OK {
		return fmt.Errorf("failed to invoke side-chain chaincode: %s", response.Message)
	}

	return nil
}

func (wc *WriteChain) GetData(ctx contractapi.TransactionContextInterface, id string) (*Data, error) {
	dataAsBytes, err := ctx.GetStub().GetState(id)
	if err != nil {
		return nil, err
	}
	if dataAsBytes == nil {
		return nil, fmt.Errorf("data with ID %s not found", id)
	}
	var data Data
	err = json.Unmarshal(dataAsBytes, &data)
	if err != nil {
		return nil, err
	}
	return &data, nil
}

func main() {
	chaincode, err := contractapi.NewChaincode(new(WriteChain))
	if err != nil {
		panic(err.Error())
	}
	if err := chaincode.Start(); err != nil {
		panic(err.Error())
	}
}

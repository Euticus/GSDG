package main

import (
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

type SideChain struct {
	contractapi.Contract
}

type Metadata struct {
	ID        string `json:"id"`
	Chain     string `json:"chain"`
	Pointer   string `json:"pointer"`
	TimeStamp int64  `json:"timestamp"`
}

func (sc *SideChain) InitLedger(ctx contractapi.TransactionContextInterface) error {
	return nil
}

func (sc *SideChain) StoreMetadata(ctx contractapi.TransactionContextInterface, id string, chain string, pointer string, timestamp int64) error {
	metadata := Metadata{
		ID:        id,
		Chain:     chain,
		Pointer:   pointer,
		TimeStamp: timestamp,
	}
	metadataAsBytes, err := json.Marshal(metadata)
	if err != nil {
		return err
	}
	return ctx.GetStub().PutState(id, metadataAsBytes)
}

func (sc *SideChain) GetMetadata(ctx contractapi.TransactionContextInterface, id string) (*Metadata, error) {
	metadataAsBytes, err := ctx.GetStub().GetState(id)
	if err != nil {
		return nil, err
	}
	if metadataAsBytes == nil {
		return nil, fmt.Errorf("metadata with ID %s not found", id)
	}
	var metadata Metadata
	err = json.Unmarshal(metadataAsBytes, &metadata)
	if err != nil {
		return nil, err
	}
	return &metadata, nil
}

func main() {
	chaincode, err := contractapi.NewChaincode(new(SideChain))
	if err != nil {
		panic(err.Error())
	}
	if err := chaincode.Start(); err != nil {
		panic(err.Error())
	}
}

package main

import (
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

type ReadChain struct {
	contractapi.Contract
}

type Pointer struct {
	ID          string `json:"id"`
	WriteDataID string `json:"write_data_id"`
}

func (rc *ReadChain) InitLedger(ctx contractapi.TransactionContextInterface) error {
	return nil
}

func (rc *ReadChain) AddPointer(ctx contractapi.TransactionContextInterface, id string, writeDataID string) error {
	pointer := Pointer{
		ID:          id,
		WriteDataID: writeDataID,
	}
	pointerAsBytes, err := json.Marshal(pointer)
	if err != nil {
		return err
	}
	return ctx.GetStub().PutState(id, pointerAsBytes)
}

func (rc *ReadChain) GetPointer(ctx contractapi.TransactionContextInterface, id string) (*Pointer, error) {
	pointerAsBytes, err := ctx.GetStub().GetState(id)
	if err != nil {
		return nil, err
	}
	if pointerAsBytes == nil {
		return nil, fmt.Errorf("pointer with ID %s not found", id)
	}

	var pointer Pointer
	err = json.Unmarshal(pointerAsBytes, &pointer)
	if err != nil {
		return nil, err
	}
	// Emit event after successful pointer addition
	eventPayload := []byte(fmt.Sprintf("Pointer added with ID: %s", id))
	err = ctx.GetStub().SetEvent("AddPointerEvent", eventPayload)
	if err != nil {
		return err
	}
	return &pointer, nil
}

func main() {
	chaincode, err := contractapi.NewChaincode(new(ReadChain))
	if err != nil {
		panic(err.Error())
	}
	if err := chaincode.Start(); err != nil {
		panic(err.Error())
	}
}

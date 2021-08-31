package main

import (
	"github.com/go-errors/errors"
	"github.com/minvws/nl-covid19-coronacheck-idemix/verifier"
	"github.com/privacybydesign/gabi"
	"encoding/json"
	"fmt"
	"syscall/js"
)

func PrettyPrint(v interface{}, created int64) (string) {
	data := map[string]interface{}{
		"created": created,
		"attributes": v,
	}

	b, err := json.MarshalIndent(data, "", "  ")

	if err != nil {
		return err.Error()
	}

	return string(b)
}

func registerCallbacks() {
	js.Global().Set("loadCerts", js.FuncOf(loadCerts))
	js.Global().Set("readCode", js.FuncOf(readCode))
}

func main() {
	c := make(chan struct{}, 0)

	println("WASM Go Initialized")

	/* Register callback functions */
	registerCallbacks()
	<-c
}

func loadCerts(this js.Value, i []js.Value) interface{} {
	if (len(i) < 1) {
		fmt.Println("Missing arguments")
	}

	testPk, _ = gabi.NewPublicKeyFromXML(i[0].String())
	vwsCc1Pk, _ = gabi.NewPublicKeyFromXML(i[1].String())
	vwsCc2Pk, _ = gabi.NewPublicKeyFromXML(i[2].String())

	return "Certificates loaded"
}

func readCode(this js.Value, i []js.Value) interface{} {
	if (len(i) < 1) {
		fmt.Println("Missing arguments")
	}
	qrData := []byte(i[0].String())

	/* Verify */
	v := createVerifier2()
	verifiedCred, err := v.VerifyQREncoded(qrData)
	if err != nil {
		fmt.Println("Could not verify disclosed credential:", err.Error())
	}

	/* Return data */
	return PrettyPrint(verifiedCred.Attributes, verifiedCred.DisclosureTimeSeconds)
}

func createVerifier2() *verifier.Verifier {
	return verifier.New(holderFindIssuerPk2)
}

func holderFindIssuerPk2(issuerPkId string) (*gabi.PublicKey, error) {
	issuerPks := map[string]*gabi.PublicKey{
		"testPk": testPk,
		"VWS-CC-1": vwsCc1Pk,
		"VWS-CC-2": vwsCc2Pk,
	}
	issuerPk, ok := issuerPks[issuerPkId]
	if !ok {
		return nil, errors.Errorf("Could not find public key id (%s) chosen by issuer", issuerPkId)
	}

	return issuerPk, nil
}

var testPk *gabi.PublicKey
var vwsCc1Pk *gabi.PublicKey
var vwsCc2Pk *gabi.PublicKey

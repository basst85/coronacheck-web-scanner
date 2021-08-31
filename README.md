# Intro

A web-app to scan the Dutch QR-code produced by the CoronaCheck app and shows it's validity.
It's completely running client-side in the webbrowser. 

This is an unofficial tool that is in no way affiliated with CoronaCheck.nl or the Ministry of VWS.

# Misc

This repository contains the public keys from VWS. You can download the newest versions via https://holder-api.coronacheck.nl/v4/holder/public_keys.
The main.go script is based on an example created by [Rick van der Zwet](https://github.com/rickvanderzwet/nl-rickvanderzwet-coronacheck-example).

# Installation

* Build the main.go as WebAssembly (wasm) binary:
```
GOARCH=wasm GOOS=js go build -o lib.wasm main.go
```
* Navigate to the "JS" directory and copy your local wasm_exec.js file:
```
cp "$(go env GOROOT)/misc/wasm/wasm_exec.js" .
```
* Start the webserver, on port 8080:
```
go run server.go
```
* Navigate in the webbrowser to http://localhost:8080/scanner.html
* Allow access to the webcam

# License

The program is licensed under the [MIT License](https://github.com/basst85/coronacheck-web-scanner/blob/main/LICENSE.txt).

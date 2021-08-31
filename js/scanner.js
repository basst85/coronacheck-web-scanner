let canvasElement = document.getElementById("canvas");
let canvas = canvasElement.getContext("2d");
let errorDiv = document.getElementById('error');
let video = document.getElementById('video');
let scanResult = document.getElementById("scanResult");
let testPk = "";
let vwsCC1 = "";
let vwsC2 = "";
let certsLoaded = false;
let result = "";

function setup() {
    fetch('testPk.xml')
    .then(response => response.text())
    .then(xmlString => testPk = xmlString)
    fetch('VWS-CC-1.xml')
    .then(response => response.text())
    .then(xmlString => vwsCC1 = xmlString)
    fetch('VWS-CC-2.xml')
    .then(response => response.text())
    .then(xmlString => vwsCC2 = xmlString)

    if (!WebAssembly.instantiateStreaming) {
        // polyfill
        WebAssembly.instantiateStreaming = async(resp, importObject) => {
            const source = await(await resp).arrayBuffer();
            return await WebAssembly.instantiate(source, importObject);
        };
    }

    const go = new Go();
    let mod,
    inst;

    WebAssembly.instantiateStreaming(fetch("lib.wasm"), go.importObject).then(
        async result => {
        mod = result.module;
        inst = result.instance;
        await go.run(inst);
        inst = await WebAssembly.instantiate(mod, go.importObject); // reset instance
    });

    let constraints = {
        video: {
            facingMode: 'environment'
        }
    };
    navigator.mediaDevices.getUserMedia(constraints)
    .then(function (mediaStream) {
        video.srcObject = mediaStream;
        video.onloadedmetadata = function (e) {
            video.play();
            canvasElement.width = video.videoWidth;
            canvasElement.height = video.videoHeight;
            scanResult.style.marginTop = video.videoHeight + 20;
            requestAnimationFrame(getBarcodes);
        };
    })
    .catch(function (err) {});
}

setup()

async function getBarcodes() {
    if (certsLoaded == false) {
        certs = await loadCerts(testPk, vwsCC1, vwsCC2);
        certsLoaded = true;
    }
    if (!video.paused) {
        try {
            canvasElement.height = video.videoHeight;
            canvasElement.width = video.videoWidth;

            canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
            let imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
            let code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "dontInvert",
            });

            if (code) {
                let result = await readCode(code.data);
                let jsonResult = JSON.parse(result);

                timestampDiff = (Math.floor(Date.now() / 1000) - jsonResult.created);
                valid = ((+jsonResult.attributes.validFrom + (+jsonResult.attributes.validForHours * 3600)) - Math.floor(Date.now() / 1000));

                if (timestampDiff < 180 && valid > 0) {
                    scanResult.style.background = "green";
                    scanResult.innerHTML = `Geboortedag: ${jsonResult.attributes.birthDay}<br/>
					Geboortemaand: ${jsonResult.attributes.birthMonth}<br/>
					Initialen voornaam: ${jsonResult.attributes.firstNameInitial}<br/>
					Initialen achternaam: ${jsonResult.attributes.lastNameInitial}`;
                } else {
                    scanResult.style.background = "red";
                    scanResult.innerHTML = "NIET OK";
                }
            }
        } catch (exception) {
            errorDiv.innerText = exception;
        };
    }

    requestAnimationFrame(getBarcodes);
}
let canvasElement = document.getElementById("canvas");
let canvas = canvasElement.getContext("2d");
let errorDiv = document.getElementById('error');
let video = document.getElementById('video');
let scanResult = document.getElementById("scanResult");

function setup() {	
	let constraints = {video: {facingMode: 'environment'}};
	navigator.mediaDevices.getUserMedia(constraints)
		.then(function(mediaStream) {
			video.srcObject = mediaStream;
			video.onloadedmetadata = function(e) {
				video.play();
				canvasElement.width = video.videoWidth;
				canvasElement.height = video.videoHeight;
				scanResult.style.marginTop = video.videoHeight + 20;
										
				requestAnimationFrame(getBarcodes);
			};
		})
		.catch(function(err) {  }); 
}

setup()

async function getBarcodes(){

	if(!video.paused){
		try{
			canvasElement.height = video.videoHeight;
			canvasElement.width = video.videoWidth;
			
			canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
			let imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
			let code = jsQR(imageData.data, imageData.width, imageData.height, {
				inversionAttempts: "dontInvert",
			});

			if (code) {
				const formData = new FormData();
				formData.append('qrData', code.data);

				fetch('/scanner.php', {
					method: 'POST',
					body: formData
				})
				.then(response => response.json())
				.then(result => {
					timestampDiff = (Math.floor(Date.now() / 1000) - result.created);
					valid = ((+result.attributes.validFrom + (+result.attributes.validForHours * 3600) ) - Math.floor(Date.now() / 1000));

					if ( timestampDiff < 180 && valid > 0 ) {
						scanResult.style.background = "green";
						scanResult.innerHTML = `Geboortedag: ${result.attributes.birthDay}<br/>
												Geboortemaand: ${result.attributes.birthMonth}<br/>
												Initialen voornaam: ${result.attributes.firstNameInitial}<br/>
												Initialen achternaam: ${result.attributes.lastNameInitial}`;
					} else {
						scanResult.style.background = "red";
						scanResult.innerHTML = "NIET OK";
					}
				})
				.catch(error => {
					scanResult.style.background = "red";
					scanResult.innerHTML = "NIET OK";
				});
			}
		}
		catch(exception) {
			errorDiv.innerText = exception;
		};
	}
	
	requestAnimationFrame(getBarcodes);
}
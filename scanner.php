<?php
	if( $_POST["qrData"] ) {
		$tempFile = tmpfile();
		$tempPath = stream_get_meta_data($tempFile)['uri'];
		fwrite($tempFile, $_POST["qrData"]);

		echo shell_exec("coronacheck-scan.exe ". $tempPath);

		fclose($tempFile); // removes the temp file

		exit();
	}
?>
<html>
	<head>
		<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.min.js"></script>
		<script src="js/jsQR.js"></script>
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		
		<style>
			.container {
				display: flex;
			}
			
			.canvas {
				position: absolute;
				margin-top: 8px;
				margin-left: 8px;
				z-index: 10;
			}
			
			.video {
				display: none
			}
			
			.scanResult {
				position: absolute;
				font-size: 24px;
				margin-left: 8px;
				padding: 20px;
				color: #fff;
			}
		</style>
	</head>
	<body>
		<div id="error"></div>
		
		<div class="container">
		<video class="video" id="video"></video>
		<canvas class="canvas" id="canvas"></canvas>
		</div>
		<span class="scanResult" id="scanResult"></span>
		
		<script src="js/scanner.js"></script>
	</body>
</html>
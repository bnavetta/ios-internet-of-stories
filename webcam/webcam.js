const video = document.createElement('video');
const canvas = document.createElement('canvas');
const submitButton = document.createElement('button');
const cancelButton = document.createElement('button');
const enableWebCam = document.createElement('button');

var webcam_stream;

video.id = "is_video"
canvas.id = "is_canvas"
submitButton.id = "is_submitButton"
enableWebCam.id = "is_webCamButton"
cancelButton.id = "is_cancelButton"

document.body.appendChild(video)
document.body.appendChild(canvas)
document.body.appendChild(submitButton)
document.body.appendChild(enableWebCam)
document.body.appendChild(cancelButton)

enableWebCam.textContent = "Create Story"
enableWebCam.onclick=function () {
	video.style.display = "initial"; 
	// Get access to the camera!
	if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
		// Not adding `{ audio: true }` since we only want video now
		navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
		webcam_stream = stream
		video.src = window.URL.createObjectURL(webcam_stream);
		video.play();
		});
	}		
};

cancelButton.textContent = "Cancel"
cancelButton.onclick=function() {
	var track = webcam_stream.getTracks()[0];  // if only one media track
	track.stop();
	track = null;
	video.style.display="none";
}

submitButton.textContent = "Submit"
submitButton.onclick=function() {
	var context = canvas.getContext('2d');
	context.drawImage(video, 0, 0, 200, 200);
	var imageUrl = canvas.toDataURL('image/png')

	window.postMessage({ type: 'ADD_TO_STORY', imageUrl: imageUrl }, '*')
	
};

// manages recording

let modal = document.getElementById("recording-menu-bg");
//let openBtn = document.getElementById("record");

function openRecordingMenu() {
    modal.style.display = "block";
}

function closeRecordingMenu() {
    modal.style.display = "none";
}


function startRender() {
    console.log("starting new render");
    let format;
    if (document.getElementById("gif").checked) {
	format = "gif";
    }
    else {
	format = "png"
    }

    let verbose = document.getElementById("verbose").checked;
    let frames = document.getElementById("frame-count").value;

    let capturer = new Capturer(format, frames, verbose);
    capturers.push(capturer);

}

class Capturer {
    constructor(format, frames, verbose) {
	this.framesDone = 0;
	this.format = format;
	this.framesLength = frames;
	this.ccap = new CCapture( {
	    format: format,
	    framerate: 60,
	    verbose : verbose,
	});
	console.log(this)
	this.ccap.start();
    }

    update(canvas) {
	if ( this.framesDone <= this.framesLength ) {
	    console.log("updating capturer");
	    this.ccap.capture(canvas)
	    this.framesDone++;
	    return true
	}
	else {
	    console.log("stopping capturer");
	    this.ccap.stop()
	    this.ccap.save()
	    return false
	}
    }
}

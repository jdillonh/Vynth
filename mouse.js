// to handle mouse & making new patch cords

var mouseState = {
    lookingFor : null, //"inlet", "outlet", null
    from : null,
}

window.addEventListener("click", function(e) {
    if( e.target.className === "inlet") {
	if( mouseState.lookingFor === "inlet" ) {
	    newPatchCord( e.target.id, mouseState.from.id );
	    clearMouseState();
	}
	else if ( mouseState.lookingFor === "outlet" ) {
	    cancelNewPatchCord();
	    clearMouseState();
	}
	else if ( mouseState.lookingFor === null ) {
	    mouseState.lookingFor = "outlet";
	    mouseState.from = e.target;
	}
	else {
	    throw "invalid mouse state";
	}
    }

    else if ( e.target.className === "outlet" ) {
	if( mouseState.lookingFor === "inlet" ) {
	    cancelNewPatchCord();
	    clearMouseState();
	}
	else if ( mouseState.lookingFor === "outlet" ) {
	    newPatchCord( mouseState.from.id , e.target.id );
	    clearMouseState();
	}
	else if ( mouseState.lookingFor === null ) {
	    mouseState.lookingFor = "inlet";
	    mouseState.from = e.target;
	}
	else {
	    throw "invalid mouse state";
	}
    }

    else { // not an inlet or outle
	if( mouseState.lookingFor ) {
	    cancelNewPatchCord();
	    clearMouseState();
	}
    }
});

function clearMouseState() {
    mouseState.lookingFor = null;
    mouseState.from = null;
}

// to handle mouse & making new patch cords
/**
 * Stores the mouse state
 * @type {Object}
 */
var mouseState = {
    lookingFor : null, //"inlet", "outlet", null
    from : null,
}

/**
 * Handle user clicks, make a new connection or don't
 */
window.addEventListener("click", function(e) {
    if (e.target.id === "recording-menu-bg") {
	e.target.style.display = "none";
    }

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

/**
 * If there is a pending connection, cancel it.
 */
function clearMouseState() {
    mouseState.lookingFor = null;
    mouseState.from = null;
}

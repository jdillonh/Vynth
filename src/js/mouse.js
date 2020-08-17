// to handle mouse & making new patch cords
/**
 * Stores the mouse state
 * @type {Object}
 */
var mouseState = {
    lookingFor : null, //"inlet", "outlet", null
    from : null,
    xPos : 0,
    yPos : 0,
}

/**
 * Handle mouse move, update pending patch cord
 */
let a =(function() {
    let uiToggle = document.getElementById("collapse-menu");
    window.addEventListener("mousemove", function(e) {
	let x = e.clientX;
	let y = e.clientY;
	mouseState.xPos = x;
	mouseState.yPos = y;
	updatePendingPatchCord();
    });
});
a();


/**
 * Handle user clicks, make a new connection or don't
 */
window.addEventListener("click", function(e) {
    if (e.target.id === "recording-menu-bg") {
	e.target.style.display = "none";
    }

    if( e.target.className === "inlet") {
	if( mouseState.lookingFor === "inlet" ) {
	    cancelPendingPatchCord();
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
	    // make a pending patch cord
	    newPatchCord( e.target.id, null, true );
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
	    cancelPendingPatchCord();
	    newPatchCord( mouseState.from.id , e.target.id );
	    clearMouseState();
	}
	else if ( mouseState.lookingFor === null ) {
	    mouseState.lookingFor = "inlet";
	    mouseState.from = e.target;
	    // make a pending patch cord
	    newPatchCord( null, e.target.id, true );
	}
	else {
	    throw "invalid mouse state";
	}
    }

    else { // not an inlet or outle
	// should be able to remove this vv
	if( mouseState.lookingFor !== null ) {
	    cancelPendingPatchCord();
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

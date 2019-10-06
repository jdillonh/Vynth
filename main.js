/** 
 * SVG library interface
 * @type {Object}
 */
var svgDraw = SVG("patch-cord-canvas")
    .size( window.innerWidth, window.innerHeight );
/** 
 * Number of modules on canvas
 * @type {number}
 */
var moduleCount = 0;
/** 
 * Sum of number of inlets on each object on canvas
 * @type {number}
 */
var inletCount = 0;
/** 
 * Sum of number of outlets on each object on canvas
 * @type {number}
 */
var outletCount = 0;
/** 
 * Number of patch cords (connections) on canvas
 * @type {number}
 */
var patchCordCount = 0;

/**
 * Graph representing all connections between objects. Objects 
 * with no connections are ignored.
 * @type {Object[]}
 */
var patchCordGraph = [];

/**
 * Adds a patch cord between two objects on screen, visually and in 
 * the internal graph.
 * @param {string} to DomEl ID of destination of cord
 * @param {string} from DomEl ID of destination of cord
 */
function newPatchCord(to, from) {
    let newPath = svgDraw.path(
	['M', 0, 0]
    ).stroke();
    
    newPath.id("patch-cord-"+patchCordCount)
    newPath.addClass("patch-cord")
    patchCordCount++;

    let newNode = {
	to : to, // id of to, id of from  (INLET)
	from : from, // ik this is a mess I'm so sorry (OUTLET)
	id : "patch-cord-" + patchCordCount,
	//svg : newLine,
	path: newPath,
    }
    patchCordGraph.push( newNode );

    updateCoordinates( [newNode] );
}

/**
 * If there is a pending connection, cancel it.
 */
function cancelNewPatchCord() {
    mouseState.lookingFor = null;
    mouseState.from = null;
}

/**
 * Updates the coordinates of patch cord to/from positions.
 * @param {Object[]} cords Cords whose positions shoule be updated
 */
function updateCoordinates(cords) {
    for( let cord of cords ) {
	let toElement = document.getElementById(cord.to);
	let fromElement = document.getElementById(cord.from);


	let x1 = getTotalOffsetLeft(fromElement) + 8,
	    y1 = getTotalOffsetTop(fromElement) + 8,
	    x2 = getTotalOffsetLeft(toElement) + 8,
	    y2 = getTotalOffsetTop(toElement) + 8;
	//cord.svg.plot(x1, y1, x2, y2)

	let bezDist = 40;
	cord.path.plot(
	    [
		
		['M', String(x1), String(y1)],
		['C', String(x1 + bezDist), String(y1),
		 String(x2 - bezDist), String(y2),
		 String(x2), String(y2) ],
	    ]
	)
	    .fill("none")
	    .stroke({ width : 4,
		      linecap : "round",
		      color: "white" } );

	let container = document.getElementById("patch-cord-canvas")
	if( x1 > container.clientWidth ||
	    x2 > container.clientWidth ) {
	    container.style.width = String( x1 > x2 ? x1 + 100 : x2 + 100 ) + 'px';
	}
	if( y1 > container.clientHeight ||
	    y2 > container.clientHeight ) {
	    container.style.height = String( y1 > y2 ? y1 + 100 : y2 + 100 ) + 'px';
	}
	
	
    }
}

/**
 * Called by mouseDrag, updates cords connected to clicked object.
 * @param {Object} e Event
 */
function updatePatchCords(e) {
    // e is Event from mouseDrag
    // returns a list of patch cord nodes to update
    let module = e.target.parentElement;
    if( !module ) { return; }
    let inlets = module.getElementsByClassName("inlet")
    let outlets = module.getElementsByClassName("outlet")
    let shouldBeUpdated = patchCordGraph.filter( node => {
	for( let i of inlets ) {
	    if( i.id === node.to || i.id === node.from ) {
		return true;
	    }
	}
	for( let o of outlets ) {
	    if( o.id === node.to || o.id === node.from ) {
		return true;
	    }
	}
	return false;
    });
    updateCoordinates( shouldBeUpdated );
}

/**
 * Makes a DOM element draggable, from W3Schools
 * @param {Object} elmnt DomEl to make draggable
 */
function makeDraggable(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    elmnt.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
	e = e || window.event;
	e.preventDefault();
	// get the mouse cursor position at startup:
	pos3 = e.clientX;
	pos4 = e.clientY;
	document.onmouseup = closeDragElement;
	// call a function whenever the cursor moves:
	document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
	e = e || window.event;
	e.preventDefault();
	updatePatchCords(e);
	// calculate the new cursor position:
	pos1 = pos3 - e.clientX;
	pos2 = pos4 - e.clientY;
	pos3 = e.clientX;
	pos4 = e.clientY;
	// set the element's new position:
	elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
	elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
	// stop moving when mouse button is released:
	document.onmouseup = null;
	document.onmousemove = null;
    }
}

/** 
 * Helper to makeDraggable, gets x position
 * @param {Object} ele DomElement
 * @returns number
 */
function getTotalOffsetLeft( ele ) {
    let total = 0
    while( ele ) {
	total += ele.offsetLeft;
	ele = ele.parentElement;
    }
    return total;
}

/** 
 * Helper to makeDraggable, gets y position
 * @param {Object} ele DomElement
 * @returns number
 */
function getTotalOffsetTop( ele ) {
    let total = 0
    while( ele ) {
	total += ele.offsetTop;
	ele = ele.parentElement;
    }
    return total;
}

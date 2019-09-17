var svgDraw = SVG("patch-cord-canvas")
    .size( window.innerWidth, window.innerHeight );

var moduleCount = 0;
var inletCount = 0;
var outletCount = 0;
var patchCordCount = 0;

var patchCordGraph = [];

function newPatchCord(from, to) {
    //let newLine = svgDraw.line(0, 0, 0, 0).stroke({width : 1});
    //newLine.id("patch-cord-"+patchCordCount)
    //patchCordCount++;
    let newPath = svgDraw.path(
	['M', 0, 0]
    ).stroke();
    
    newPath.id("patch-cord-"+patchCordCount)
    newPath.addClass("patch-cord")
    patchCordCount++;

    let newNode = {
	to : from, // id of to, id of from  (INLET)
	from : to, // ik this is a mess I'm so sorry (OUTLET)
	id : "patch-cord-" + patchCordCount,
	//svg : newLine,
	path: newPath,
    }
    patchCordGraph.push( newNode );

    updateCoordinates( [newNode] );
}

function cancelNewPatchCord() {
    mouseState.lookingFor = null;
    mouseState.from = null;
}

function addTestPatchCord() {
    newPatchCord("outlet-0", "inlet-2");
}

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
//document.getElementById("new-mod-button").onclick =
//    function(e) {
//	let newMod = document.importNode(
//	    document.getElementById("module-template").content, true)
//	moduleCount++;
//	document.getElementById("module-canvas")
//	    .appendChild(newMod);
//	let appendedNewMod =
//	    document.getElementById("module-x");
//	appendedNewMod.id = "module-" + moduleCount;
//	//document.getElementById("module-x-header").id =
//	//    "module-" + moduleCount +"-header";
//	appendedNewMod.style.top = "100px";
//	appendedNewMod.style.left = "100px";
//
//	// give inlets and outlets unique IDs
//	let ins = appendedNewMod.getElementsByClassName("inlet")
//	for( let inlet of ins ) {
//	    inlet.id = "inlet-" + inletCount;
//	    inletCount++;
//	}
//	let outs = appendedNewMod.getElementsByClassName("outlet")
//	for( let outlet of outs ) {
//	    outlet.id = "outlet-" + outletCount;
//	    outletCount++;
//	}
//	makeDraggable(appendedNewMod);
//    }

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


function getTotalOffsetLeft( ele ) {
    let total = 0
    while( ele ) {
	total += ele.offsetLeft;
	ele = ele.parentElement;
    }
    return total;
}


function getTotalOffsetTop( ele ) {
    let total = 0
    while( ele ) {
	total += ele.offsetTop;
	ele = ele.parentElement;
    }
    return total;
}

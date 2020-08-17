/**
 * Adds a module to the canvas
 * @param {Object} type Type of mdule from the table "modules"
 * @see modules
 */
function addModule( type ) {

    let newMod = document.importNode(
	document.getElementById("module-template").content, true
    )
    moduleCount++;
    document.getElementById("module-canvas")
	.appendChild(newMod);
    let appendedNewMod =
	document.getElementById("module-x");
    appendedNewMod.id = "module-" + moduleCount;
    // document.getElementById("module-x-header").id =
    //    "module-" + moduleCount +"-header";
    appendedNewMod.style.top = "100px";
    appendedNewMod.style.left = "100px";

    let numInlets = type.inlets;
    let numOutlets = type.outlets;

    // give inlets and outlets unique IDs
    let insWrap = appendedNewMod.getElementsByClassName("inlet-wrapper")[0];
    for( let i = 0; i < numInlets; i++ ) {
	let newIn = document.createElement("div");
	newIn.id = "inlet-"+inletCount;
	newIn.className = "inlet";
	inletCount++;
	insWrap.appendChild(newIn);
    }

    let outsWrap = appendedNewMod.getElementsByClassName("outlet-wrapper")[0];
    for( let i = 0; i < numOutlets; i++ ) {
	let newOut = document.createElement("div");
	newOut.id = "outlet-"+outletCount;
	newOut.className = "outlet";
	outletCount++;
	outsWrap.appendChild(newOut);
    }
    appendedNewMod.className += " " + type.type;
    appendedNewMod.getElementsByClassName("guts")[0]
	.textContent= type.textContent;

    if( modules[type.type].extraHTML ) {
	let template = document.createElement('template');
	let extra = modules[type.type].extraHTML.trim(); // Never return a text node of whitespace as the result
	template.innerHTML = extra;
	appendedNewMod.appendChild( template.content.firstChild );
    }

    makeDraggable(appendedNewMod);

    appendedNewMod.oncontextmenu = (e) => {
	e.preventDefault();
	removeModule(appendedNewMod.id);
	return false;
    }
}

/**
 * Remove a module from the UI and the graph
 * @param {String} moduleID DomEl id of the module to remove
 */
function removeModule(moduleID) {
    let domEl = document.getElementById(moduleID);

    // get inputs and outputs in Obj 
    let inIds = Array.from(domEl.getElementsByClassName('inlet-wrapper')[0].childNodes)
	.map( (i) => i.id )
	.filter( (i) => i !== undefined );
    let inObj = {};
    inIds.forEach( (i) => { inObj[i] = true } );
    
    let outIds = Array.from(domEl.getElementsByClassName('outlet-wrapper')[0].childNodes)
	.map( (i) => i.id )
	.filter( (i) => i !== undefined );
    let outObj = {};
    outIds.forEach( (i) => { outObj[i] = true } );

    // match inputs and outputs, delete if theres a match
    patchCordGraph = patchCordGraph.filter(
	(currConnection) => {
	    let keepMe = true;
	    if( currConnection.to in inObj ||
		currConnection.from in outObj ) {
		keepMe = false;
		deletePatchCord(currConnection.id);
	    }
	    return keepMe;
	}
    );
    domEl.parentNode.removeChild(domEl);
}

/**
 * Data about every type of module
 * @function glslSnippet tells the compiler what GLSL code this module corresponds to
 */
var modules = {
    // Out
    eyeOut : {
	type : "eyeOut",
	inlets : 3,
	outlets : 0,
	textContent : "out",
	extraHTML: "&#x3a9;",
	glslSnippet : ( red, green, blue ) => {
	    if( red == [] )  red = '0.0' ;
	    if( blue == [] )  blue = '0.0' ;
	    if( green == [] )  green = '0.0' ;
	    return `gl_FragColor = vec4( ${red}, ${green}, ${blue}, 1.0 );`;
	}
	
    },

    // Uniforms
    // each module corresponds to a uniform
    // named after its own module number
    // (the id of the HTML object that
    // represents it)
    // id : "module-1" => u_1, etc.
    // The module element is passed to
    // glslSnippet by the compiler.
    // the uniforms are set by the onchange 
    // attribute of the input element
    knobUnifom : {
	isUniform : true,
	inlets : 0,
	outlets : 1,
    },
    numBoxUniform : {
	isUniform : true,
	type : "numBoxUniform",
	inlets : 1,
	outlets : 1,
	extraHTML : `<input type="number" step="0.01" value="1.0"
                      class="uniformValue"
                      onclick="this.focus()"
                      onchange="pushUniformUpdate(this)">`,
	//textContent : "1",
	glslSnippet : ( in1, color, moduleEl ) => {
	    let modNum = getModuleIdNum(moduleEl)
	    if( in1 !== '' ) {
		return in1 + ' * ' + "u_" + modNum;
	    }
	    return "u_" + modNum;
	}
    },

    midiUniform : {
	isUniform : true,
	type : "midiUniform",
	inlets : 1,
	outlets : 1,
	extraHTML :`
<input type="number" step="1" value="0"
                      class="uniformValue midi-input"
                      onclick="this.focus()"
                      onchange="pushMidiUniformUpdate(this)">
`,

	//textContent : "1",
	glslSnippet : ( in1, color, moduleEl ) => {
	    let modNum = getModuleIdNum(moduleEl)
	    if( in1 !== '' ) {
		return in1 + ' * ' + "u_" + modNum;
	    }
	    return "u_" + modNum;
	}
    },

    // Operators
    multOp : {
	type : "multOp",
	inlets : 2,
	outlets : 1,
	//textContent : '*',
	extraHTML: `<div id="mult-op"> * </div>`,
	glslSnippet : (in1, in2) => {
	    if( in1 === undefined || in1 === '' ) {
		in1 = '0.0';
	    }
	    if( in2 === undefined || in2 === '' ) {
		in2 = '0.0';
	    }
	    return `(${in1} * ${in2})`;
	}
    },

    // Drivers
    xDriver : {
	type : "xDriver",
	inlets : 0,
	outlets : 1,
	textContent : "x",
	extraHTML : "&#8658",
	glslSnippet : () => { return "vTexCoord.x" },
    },
    yDriver : {
	type : "yDriver",
	inlets : 0,
	outlets : 1,
	textContent : "y",
	extraHTML : `<div style="transform: rotate(-90deg);"> &#8658 </div>`,
	glslSnippet : () => { return "vTexCoord.y" },
    },
    timeDriver : {
	type : "timeDriver",
	inlets : 0,
	outlets : 1,
	extraHTML  : "<em> t </em>",
	glslSnippet : () => { return "u_time/100.0" },
    },
    angleDriver : {
	type : "angleDriver",
	inlets : 2,
	outlets : 1,
	textContent : "angle",
	extraHTML : "&theta;",
	glslSnippet : (in1, in2) => { return `\
(atan( ${in1}-0.5,${in2}-0.5)+3.14)/(2.0*3.14)`
				    }
    },

    radiusDriver : {
	type : "radiusDriver",
	inlets : 2,
	outlets : 1,
	textContent : "rad",
	glslSnippet : (in1, in2) => {
	    if( in1 === '' ) {
		in1 = '0.0';
	    }
	    if( in2 === '' ) {
		in2 = '0.0';
	    }
	    return `2.0*distance(vec2(${in1}, ${in2}), vec2(0.5, 0.5))`;
	}
    },

    // Oscillators
    sinOsc : {
	type : "sinOsc",
	inlets : 2,
	outlets : 1,
	textContent : "sin",
	icon : null,
	glslSnippet : ( driver, offset, color ) => {
	    let inputs = oscVerifyInputs(driver, offset, color);
	    driver = inputs.driver;
	    offset = inputs.offset;
	    let op = inputs.op;

	    return `((sin( 10.0 * ${driver} ${op} ${offset} )+1.0)/2.0)`;
	},
    },
    triOsc : {
	type : "triOsc",
	inlets : 2,
	outlets : 1,
	textContent : "tri",
	icon : null,
	glslSnippet : ( driver, offset, color ) => {

	    let inputs = oscVerifyInputs(driver, offset, color);
	    driver = inputs.driver;
	    offset = inputs.offset;
	    let op = inputs.op;

	    return `abs(mod(2.0 * ${driver} ${op} ${offset},  2.0) - 1.0)`;
	}
    },
    sawOsc : {
	type : "sawOsc",
	inlets : 2,
	outlets : 1,
	textContent : "saw",
	icon : null,
	glslSnippet : ( driver, offset, color ) => {

	    let inputs = oscVerifyInputs(driver, offset, color);
	    driver = inputs.driver;
	    offset = inputs.offset;
	    let op = inputs.op;

	    return `fract( 10.0 * ${driver} ${op} ${offset} )`;
	}
    },
    sqrOsc : {
	type : "sqrOsc",
	inlets : 2, //TODO add PW / PWM
	outlets : 1,
	textContent : "sqr",
	icon : null,
	glslSnippet : ( driver, offset, color ) => {

	    let inputs = oscVerifyInputs(driver, offset, color);
	    driver = inputs.driver;
	    offset = inputs.offset;
	    let op = inputs.op;

	    return `floor(mod(10.0 * ${driver} ${op} ${offset}, 1.9))`;
	}
    },


    // Transformations 
    rotateTrans : { //NYI
	inlets : 1,
	outlets : 1,
	textContent : "rot",
	glslSnippet : () => {
	    return ``;
	},
    },
    kaleidTrans : { //NYI
	inlets : 1,
	outlets : 1,
	textContent : "kal",
    },
    repeatTrans : {
	type : "repeatTrans",
	inlets : 2,
	outlets : 1,
	textContent : "rep",
	glslSnippet : ( input, interval, args ) => {
	    if( interval === undefined || interval === "" ) {
		interval = "0.5";
	    }
	    return `mod(${input}, ${interval})`;
	}
    },

};

function oscVerifyInputs(driver, offset, color ) {
    if (driver === null ) {
	driver = "0.0";
    }

    let op = '+';

    if(!offset || color == "green" ) {
	offset = "0.0";
    }
    else if( color == "red" ) {
	op = '-';
    }
    else if( color == "blue" ) {
	op = '+';
    }
    else {
	throw "bad color:" + color;
    }

    return {driver : driver,
	    offset : offset,
	    op : op};
}


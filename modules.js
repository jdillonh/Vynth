/**
 * Adds a module to the canvas
 * @param {Object} type Type of mdule from the table "modules"
 * @see modules
 */
function addModule( type ) {
    console.log("adding", type);
    if( !type  ) {
	throw "no such module type \"" + type + "\"";
    }

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

    console.log(type)

    if( modules[type.type].extraHTML ) {
	let template = document.createElement('template');
	let extra = modules[type.type].extraHTML.trim(); // Never return a text node of whitespace as the result
	template.innerHTML = extra;
	appendedNewMod.appendChild( template.content.firstChild );
    }

    makeDraggable(appendedNewMod);
}

/**
 * Data about every type of module
 */
var modules = {
    // Out
    eyeOut : {
	type : "eyeOut",
	inlets : 3,
	outlets : 0,
	textContent : "out",
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
    // the unifors are set by the onchange 
    // attribute of the input element
    knobUnifom : {
	isUniform : true,
	inlets : 0,
	outlets : 1,
    },
    numBoxUniform : {
	isUniform : true,
	type : "numBoxUniform",
	inlets : 0,
	outlets : 1,
	extraHTML : `<input type="number" step="0.01" value="1.0"
                      class="uniformValue"
                      onclick="this.focus()"
                      onchange="pushUniformUpdate(this)">`,
	//textContent : "1",
	glslSnippet : ( color, moduleEl ) => {
	    let modNum = getModuleIdNum(moduleEl)
	    return "u_" + modNum;
	}
    },

    // Operators
    multOp : {
	type : "multOp",
	inlets : 2,
	outlets : 1,
	textContent : '*',
	glslSnippet : (in1, in2) => {
	    if( in1 === undefined ) {
		in1 = 0.0;
		console.log("multiply must have 2 inlets!")
	    }
	    if( in2 === undefined ) {
		in2 = 0.0;
		console.log("multiply must have 2 inlets!")
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
	glslSnippet : () => { return "vTexCoord.x" },
    },
    yDriver : {
	type : "yDriver",
	inlets : 0,
	outlets : 1,
	textContent : "y",
	glslSnippet : () => { return "vTexCoord.y" },
    },
    timeDriver : {
	type : "timeDriver",
	inlets : 0,
	outlets : 1,
	textContent : "t",
	glslSnippet : () => { return "u_time/100.0" },
    },

    // Oscillators
    sinOsc : {
	type : "sinOsc",
	inlets : 2,
	outlets : 1,
	textContent : "sin",
	icon : null,
	glslSnippet : ( driver, offset, color ) => {
	    let op = '+';
	    if( !offset || color == "green") {
		op = '';
		offset = '';
	    }
	    else if( color == "red" ) {
		op = '-';
	    }
	    else if( color == "blue" ) {
		op = '+';
	    }
	    else {
		throw "bad color"
	    }
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
	    let op = '+';
	    if( !offset || color == "green") {
		op = '';
		offset = '';
	    }
	    else if( color == "red" ) {
		op = '-';
	    }
	    else if( color == "blue" ) {
		op = '+';
	    }
	    else {
		throw "bad color"
	    }
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
	    let op = '+';
	    if( !offset || color == "green") {
		op = '';
		offset = '';
	    }
	    else if( color == "red" ) {
		op = '-';
	    }
	    else if( color == "blue" ) {
		op = '+';
	    }
	    else {
		throw "bad color"
	    }
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
	    let op = '+';
	    if( !offset || color == "green") {
		op = '';
		offset = '';
	    }
	    else if( color == "red" ) {
		op = '-';
	    }
	    else if( color == "blue" ) {
		op = '+';
	    }
	    else {
		throw "bad color"
	    }
	    return `floor(mod(10.0 * ${driver} ${op} ${offset}, 1.9))`;
	}
    },


    // Transformations 
    rotateTrans : {
	inlets : 1,
	outlets : 1,
	textContent : "rot",
	glslSnippet : () => {
	    return ``;
	},
    },
    kaleidTrans : {
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

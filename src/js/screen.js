/**
 * @fileOverview screen.js manages the p5.js interface, loading shaders, drawing to canvas, etc.
 */

/**
 * A default vertex shader
 * @type {string}
 */
const vertexShader = `
attribute vec3 aPosition;
attribute vec2 aTexCoord;

varying vec2 vTexCoord;

void main() {
  vTexCoord = aTexCoord;

  vec4 positionVec4 = vec4(aPosition, 1.0);
  positionVec4.xy = positionVec4.xy * 2.0 - 1.0;

  gl_Position = positionVec4;
}
`;

/**
 * The base fragment shader that becomes the custom shader
 * @type {string}
 */
const defaultFrag = `
precision mediump float;

varying vec2 vTexCoord;

uniform float u_time;
uniform float u_width;
uniform float u_height;


void main() {

  vec2 uv = vTexCoord;

  vec4 color = vec4(0.0, 0.0, 0.0, 1.0);

  gl_FragColor = color;
}
`;

/**
 * should the shader be changes this frame?
 * @type {bool}
 */
let shaderShouldUpdate = false;
/**
 * stores the shader to be set on update
 * @type {string}
 */
let newShader;
/**
 * Queue of Key/Value pairs of uniforms to update next frame
 * @type {Array[]} 
 * [ ['u_1', 2.0], ['u_5', -0.3] ]
 */
let updateUniforms = [];

// active capture objects
let capturers = [];

// html canvas dom element
let canvasEl;

/**
 * Interface to p5.js
 * @type {Function} 
 */
const screen = ( p ) => {
    var myShad;
    p.setup = function() {
	let p5Can  = p.createCanvas( window.innerWidth, window.innerHeight, p.WEBGL );
	canvasEl = p5Can.canvas;
	canvasEl.oncontextmenu = (e) => {
	    // prevent annoying menu when you mis-click
	    e.preventDefault();
	    return false;
	};
	myShad = p.createShader( vertexShader,
				 defaultFrag );
	p.shader( myShad );
    }

    p.draw = function() {
	if( shaderShouldUpdate ){
	    myShad = p.createShader( vertexShader,
				     newShader );
	    shaderShouldUpdate = false;
	    p.shader(myShad)
	}

	myShad.setUniform('u_time', p.frameCount);
	for( let i = 0; i < updateUniforms.length; i++ ) {
	    myShad.setUniform( updateUniforms[i][0], updateUniforms[i][1] );
	}

	updateUniforms = [];
	p.rect( -p.width, -p.height, p.width*2, p.height*2);

	let finished = []
	for( let i = 0; i < capturers.length; i++ ) {
	    if (!capturers[i].update(canvasEl)) {
		finished.push(i)
	    }
	}
	for( let i = 0; i < finished.length; i++ ) {
	    capturers.splice(i, 1);
	}

    }
    p.windowResized = function() {
	p.resizeCanvas(p.windowWidth, p.windowHeight);
	myShad.setUniform('u_width', p.windowWidth);
	myShad.setUniform('u_height', p.windowHeight);
    }
}

let screenP5 = new p5(screen, 'screen');

/** 
 * Adds uniform to update Queue
 * @param {Object} mod HTML element of uniform module
 */
function pushUniformUpdate( mod ) {
    updateUniforms.push( ['u_' + getModuleIdNum(mod.parentElement), mod.value] );
}

function pushUniformUpdatePair( name, value ) {
    updateUniforms.push( [name, value] );
}

function pushMidiUniformUpdate( mod ) {
    MIDI.setListener(mod.value, // channel num
		     'u_' + getModuleIdNum(mod.parentElement)); //uniform name
}

// Tells p5 shader handler to update all the uniforms
// since updating shader happens first, calling this
// after setting shouldUpdateShader works to initalize
// all uniforms
/** 
 * Pushes an update to the Queue for all uniform values in the patch
 * Called on loading a new shader, when all unifroms have not been set yet.
 */
function pushAllUniformUpdates() {
    let uniformEls = [];
    for( let type in modules ) {
	if( modules[type].isUniform ) {
	    uniformEls.push.apply(
		uniformEls,
		[].slice.call(document.getElementsByClassName(type)) );
	    // .push.apply = concatenate arrays
	}

    }

    uniformEls.filter( e => e.classList.contains('midiUniform')).forEach( midiEl => {
	console.log('in filter i is', midiEl);
	let input = midiEl.getElementsByTagName("input")[0];
	pushMidiUniformUpdate(input);
    });

    console.log(uniformEls);
    for( let i = 0; i < uniformEls.length; i++ ) {
	let curr = uniformEls[i];
	updateUniforms.push( ['u_' + getModuleIdNum(curr),
			      curr.getElementsByClassName("uniformValue")[0].value ] )
    }
}

/** 
 * Gives the id number of a module
 * @param {Object} ModuleEl DomEl of the module
 * @returns {string} id number as string
 */
function getModuleIdNum(ModuleEl) {
    return ModuleEl.id.split('-')[1]
}
/**
 * Gives the type of a module
 * @param {Object} ModuleEl DomEl of the module
 * @returns {string} module type
 * @see modules.js
 */
function getModuleType(moduleEl) {
    return moduleEl.className.split(' ')[1];
}

/**
 * Gives the HTML Object of a module from its inlet or outlet
 * @param {string} inOutId HTML id of inlet or outlet
 * @returns {Object} 
 */
function getModule(inOutId) {
    let inout = document.getElementById(inOutId);
    let el = inout.parentElement.parentElement;
    return el
}

/**
 * Gives the inlets of a module
 * @param {Object} moduleEl HTML element of module
 * @returns {Object[]} Array of HTML elements of inlets 
 */
function getInlets( moduleEl ){
    return moduleEl.getElementsByClassName("inlet");
}

/**
 * Gives all modules immediately connected to the given module
 * @param {Object} moduleEl DomEl of module
 * @returns {Object[]} [] of DomEls of connected modules
 */
function getConnected( moduleEl ) {
    let inlets = Array.from(moduleEl.getElementsByClassName("inlet"));
    inlets = inlets.map( el => el.id );

    let result = []
    for( let inl of inlets ) {
	result.push( [] ); //holds the connectiosn to curr inlet
	for( let i = 0; i < patchCordGraph.length; i++ ) {
	    if( inl == patchCordGraph[i].to ) {
		result[result.length-1].push( getModule( patchCordGraph[i].from ) )
	    }
	}	
    }
    return result
}


/**
 * Builds a new GLSL fragment shader from the entire patch, 
 * and sets that shader to be the current shader.
 * Pushes uniform updates.
 */
function compileAll() {
    MIDI.clearListeners();

    let uniforms = [];

    let eye = document.getElementsByClassName("eyeOut");
    if( eye.length > 1 || eye.length === 0 ) {
	throw "there must be exactly one output module";
    }

    let curr = eye[0];
    let shaderLine = compile( curr, undefined);

    //get all modules that represent uniforms
    let uniformEls = [];
    for( let type in modules ) {
	if( modules[type].isUniform ) {
	    uniformEls.push.apply(
		uniformEls,
		[].slice.call(document.getElementsByClassName(type)) );
	    // .push.apply = concatenate arrays
	}
    }
    let otherUniforms = '';
    for( let i =0; i < uniformEls.length; i++ ){
	let currVal = uniformEls[i].getElementsByTagName("input")[0].value;
	otherUniforms += "uniform float u_" + getModuleIdNum(uniformEls[i])
	    + "; // " + currVal + "\n";
    }

    let resultShader = `
precision mediump float;
varying vec2 vTexCoord;
uniform float u_time;
uniform float u_width;
uniform float u_height;
${otherUniforms}

void main() {
  ${shaderLine}
}
`;
    newShader = resultShader;
    shaderShouldUpdate = true;
    console.log(resultShader, '\n\n');
    pushAllUniformUpdates();

}

// the 'color' argument represents which inlet of
// eyeOut this object eventually connects to
/** 
 * Compiles the patch into GLSL starting at a given module
 * @param {Object} moduleEl DomEl of starting module
 * @param {string} color "red" "green" or "blue", current color channel
 * @returns {string}
 * @see compileAll
 */
function compile( moduleEl, color ) {
    let connected = getConnected( moduleEl );
    let args = [];
    let undefColors = ['red', 'green', 'blue'];
    for( let conI = 0; conI < connected.length; conI++) {
	let con = connected[conI]
	let curr = ''
	for( let i = 0; i < con.length; i++ ){
	    if( i > 0 ) curr += ' + ';
	    curr += compile( con[i],
			     color === undefined ? undefColors[conI]
			     : color )
	}
	args.push(curr)
    }
    return modules[ getModuleType( moduleEl ) ].glslSnippet(...args, color, moduleEl )
}


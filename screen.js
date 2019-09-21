/*
  screen.js manages the p5.js interface,
  loading shaders, drawing to canvas, etc.
*/


const vertexShader = `
// our vertex data
attribute vec3 aPosition;
attribute vec2 aTexCoord;

// lets get texcoords just for fun! 
varying vec2 vTexCoord;

void main() {
  // copy the texcoords
  vTexCoord = aTexCoord;

  // copy the position data into a vec4, using 1.0 as the w component
  vec4 positionVec4 = vec4(aPosition, 1.0);
  positionVec4.xy = positionVec4.xy * 2.0 - 1.0;

  // send the vertex information on to the fragment shader
  gl_Position = positionVec4;
}
`;

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

let shaderShouldUpdate = false;
let newShader;

let updateUniforms = [];
// Key/Value pairs of uniforms to update this frame
// [ ['u_1', 2.0], ['u_5', -0.3] ]

const screen = ( p ) => {
    var myShad;
    p.setup = function() {
	p.createCanvas( window.innerWidth, window.innerHeight, p.WEBGL );
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
	    console.log( "setting uniform", updateUniforms[i][0], "to", updateUniforms[i][1] );
	    myShad.setUniform( updateUniforms[i][0], updateUniforms[i][1] );
	}

	updateUniforms = [];
	p.rect( -p.width, -p.height, p.width*2, p.height*2);
    }
    p.windowResized = function() {
	p.resizeCanvas(p.windowWidth, p.windowHeight);
	myShad.setUniform('u_width', p.windowWidth);
	myShad.setUniform('u_height', p.windowHeight);
    }
}

let screenP5 = new p5(screen, 'screen');

function pushUniformUpdate( mod ) {
    updateUniforms.push( ['u_' + getModuleIdNum(mod.parentElement), mod.value] )
}

// Tells p5 shader handler to update all the uniforms
// since updating shader happens first, calling this
// after setting shouldUpdateShader works to initalize
// all uniforms
function pushAllUniformUpdates() {

    let uniformEls = [];
    for( let type in modules ) {
	if( modules[type].isUniform ) {
	    console.log("in pushAll", type);
	    uniformEls.push.apply(
		uniformEls,
		[].slice.call(document.getElementsByClassName(type)) );
	    // .push.apply = concatenate arrays
	}
    }

    for( let i = 0; i < uniformEls.length; i++ ) {
	let curr = uniformEls[i];
	console.log( getModuleIdNum(curr), curr.getElementsByClassName("uniformValue")[0].value )
	updateUniforms.push( ['u_' + getModuleIdNum(curr),
			      curr.getElementsByClassName("uniformValue")[0].value ] )
    }
}

// Dom Element => STRING of the number
function getModuleIdNum(ModuleEl) {
    return ModuleEl.id.split('-')[1]
}

function getModuleType(moduleEl) {
    return moduleEl.className.split(' ')[1];
}

// inlet/outlet ID => Module DOM element & Type
function getModule(inOutId) {
    let inout = document.getElementById(inOutId);
    let el = inout.parentElement.parentElement;
    return el
}

// Module Dom element => HTMLCollection of Inlets
function getInlets( moduleEl ){
    return moduleEl.getElementsByClassName("inlet");
}


function getConnected( moduleEl ) {
    //console.log(moduleEl)
    let inlets = Array.from(moduleEl.getElementsByClassName("inlet"));
    inlets = inlets.map( el => el.id );
    //console.log("this module's ins", inlets)

    let result = []
    for( let inl of inlets ) {
	result.push( [] ); //holds the connectiosn to curr inlet
	for( let i = 0; i < patchCordGraph.length; i++ ) {
	    //console.log( patchCordGraph[i])
	    if( inl == patchCordGraph[i].to ) {
		//console.log(patchCordGraph[i]);
		result[result.length-1].push( getModule( patchCordGraph[i].from ) )
	    }
	}	
    }
    return result
}


// build a new GLSL frag shader
// from the patch
function compileAll() {
    let uniforms = [];

    let eye = document.getElementsByClassName("eyeOut");
    if( eye.length > 1 || eye.length === 0 ) {
	throw "there must be exactly one output module";
    }

    let curr = eye[0];
    let shaderLine= compile(curr, undefined)

    //get all modules that represent uniforms
    let uniformEls = [];
    for( let type in modules ) {
	if( modules[type].isUniform ) {
	    //console.log(type);
	    uniformEls.push.apply(
		uniformEls,
		[].slice.call(document.getElementsByClassName(type)) );
	    // .push.apply = concatenate arrays
	}
    }
    let otherUniforms = '';
    for( let i =0; i < uniformEls.length; i++ ){
	otherUniforms += "uniform float u_" + getModuleIdNum(uniformEls[i]) + ";\n"
    }
    console.log( uniformEls );

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
    console.log(resultShader);
    pushAllUniformUpdates();

}

// the 'color' argument represents which inlet of
// eyeOut this object eventually connects to
function compile( moduleEl, color ) {
    //console.log( getModuleType( moduleEl ))
    let connected = getConnected( moduleEl );
    let args = [];
    //for( let con of connected ) {
    let undefColors = ['red', 'green', 'blue'];
    for( let conI = 0; conI < connected.length; conI++) {
	let con = connected[conI]
	let curr = ''
	for( let i = 0; i < con.length; i++ ){
	    if( i > 0 ) curr += ' + ';
	    curr += compile( con[i],
			     color === undefined ? undefColors[conI]
			     : color )
	    //console.log( curr )
	}
	args.push(curr)
    }
    return modules[ getModuleType( moduleEl ) ].glslSnippet(...args, color, moduleEl )
}


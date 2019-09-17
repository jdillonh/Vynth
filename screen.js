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
	    myShad = p.createShader(vertexShader,
				    newShader );
	    shaderShouldUpdate = false;
	    p.shader(myShad)
	}
	myShad.setUniform('u_time', p.frameCount);
	p.rect( -p.width, -p.height, p.width*2, p.height*2);
    }
    p.windowResized = function() {
	p.resizeCanvas(p.windowWidth, p.windowHeight);
	myShad.setUniform('u_width', p.windowWidth);
	myShad.setUniform('u_height', p.windowHeight);
    }
}

let screenP5 = new p5(screen, 'screen');


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

/* old see next one
// takes DOM element of module,
// returns a list of lists of DOM elements of
// connected modules
// uses global patchCordGraph
function getConnected( moduleEl ) {
let inlets = Array.from(moduleEl.getElementsByClassName("inlet"));
inlets = inlets.map( el => el.id );
console.log("this module's ins", inlets)
inlets = inlets.sort( (a, b) => {
let aVal = parseInt( a[ a.length-1] )
let bVal = parseInt( b[ b.length-1] )
if( a > b ) return 1
else return -1;
})
let connectedEls = [];

for( let i = 0; i < patchCordGraph.length; i++ ) {
if( inlets.includes( patchCordGraph[i].to )) {
console.log(patchCordGraph[i]);
connectedEls.push( getModule( patchCordGraph[i].from ) )
}
}

return connectedEls;

}
*/

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

    let resultShader = `
precision mediump float;
varying vec2 vTexCoord;
uniform float u_time;
uniform float u_width;
uniform float u_height;

void main() {
  ${shaderLine}
}
`;
    newShader = resultShader;
    shaderShouldUpdate = true;
    console.log(resultShader);

}

// the 'color' argument represents which inlet of
// eyeOut this object eventually connects to
function compile( moduleEl, color ) {
    console.log( getModuleType( moduleEl ))
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
	    console.log( curr )
	}
	args.push(curr)
    }
    console.log(args, 'args')
    console.log(  ...args , 'spread args')
    return modules[ getModuleType( moduleEl ) ].glslSnippet(...args, color)
}


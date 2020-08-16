/*
 * WebMIDI Interface. This is experimental in most browsers.
 * We're only listening for CC.
 */



MIDI = {

    listenerMap : {
	// number controllerNumber : String moduleID
    },

    setListener : function( ctlNumber, uniformName ) {
	MIDI.listenerMap[ctlNumber] = uniformName;
	console.log('set listener', ctlNumber, uniformName);
    },

    clearListeners : function() {
	MIDI.listenerMap = {};
    },

    onMessage : function(message) {
	var command = message.data[0];
	var ctlNumber = message.data[1];
	var value = (message.data.length > 2) ? message.data[2] : 0;

	switch (command) {
	case 176: // MIDI CC Command #
	    let uniformName = MIDI.listenerMap[ctlNumber];
	    if( uniformName !== null ) {
		pushUniformUpdatePair( uniformName, value/127.0 );
	    }
	}
    },

    accessAllowed : function(midiAccess) {
	var inputs = midiAccess.inputs;
	var outputs = midiAccess.outputs;

	for (var input of midiAccess.inputs.values()) {
	    input.onmidimessage = MIDI.onMessage;
	}
    },

    accessDenied : function() {
	console.log('Error: Could not access MIDI devices.');
    },

    init : async function() {
	if (navigator.requestMIDIAccess) {
	    console.log('This browser supports WebMIDI!');

	    navigator.requestMIDIAccess().then(MIDI.accessAllowed, MIDI.accessDenied);

	} else {
	    console.log('WebMIDI is not supported in this browser.');
	}
    },
}

MIDI.init();

var APP = (function() {
	'use strict';

	var my = {};
	
	my.statustimer;

	my.load_samples=1;

	my.context;
	
	my.bufferLoader;
	my.pianobuffer = new Array();
	my.velocity_sensitive;
	
	// curve for synth fade out
	var fadeOutCurveLength = 10000;
	my.fadeOutCurve = new Float32Array(fadeOutCurveLength);
	
	for (var i = 0; i < fadeOutCurveLength; ++i){
		my.fadeOutCurve[i] = 1 / 100000000 * Math.pow( (i-10000), 2); 
	}

	
	my.isFortePedalActive = false;
	
	
	my.init = function() {

		g("LINK_about").addEventListener("click", my.showAbout);
		g("body").addEventListener("keydown", my.handleKeyboardKeyDown);
		g("body").addEventListener("keyup", my.handleKeyboardKeyUp);
		g("panic_button").addEventListener("click", SYNTH.panic);
		
		g("LINK_velocity_sensitivity").addEventListener("click",  function() {SYNTH.setVelocitySensitivity(2);} );
		g("LINK_forte_pedal").addEventListener("click",  function() {APP.setFortePedal(2);} );
		
		try {
		
			my.context = new AudioContext();
			my.log('AudioContext initialized');
		
		}
		
		catch(e) {

			alert("Your browser doesn't support the Web Audio API.\n");
		
		}


		
		console.log("SYNTH initialized");
		
		my.mastervolumeNode = my.context.createGain();
		my.mastervolumeNode.connect(my.context.destination);
		
		SYNTH.init();		
		
		/*
		//Load Buffer and decode samples
		for(var i=0;i<urls.length;++i){

			my.log('Load sample: ' + i);
			loadBuffer(urls[i],i);
			my.log('Sample loaded: ' + i);

		}*/

		
		my.setFortePedal(false);

		GUI.createKeyboard();

		console.log("Requesting MIDI access");
		if (navigator.requestMIDIAccess){
			navigator.requestMIDIAccess().then( my.onMIDIInit, my.onMIDIReject );
		}
		
		else {
			console.log("No MIDI support present in your browser.")
		}
		
		MOUSESLIDER({
			element: g("DISP_volume"),
			sensitivity: 4,
			setterFunction: my.setVolume,
			minValue: 0,
			maxValue: 100,
			minDigits: 2,
			startValue: 30,
			element_to_reset: g("volume_icon")
		});
		
		my.log('Ready!');
		
	};
	
	
	my.showAbout = function(){
		
		if (g("VIEW_about").style.display == "block"){
		
			g("VIEW_about").style.display = "none";
			g("controls").style.display = "block";
		
		}
		
		else {
		
			g("VIEW_about").style.display = "block";
			g("controls").style.display = "none";
			
		}
	
	};
	
	
	my.setFortePedal = function(pstat){
	
		if (pstat == 2){
			if (APP.isFortePedalActive == false) {
				my.setFortePedal(true);
			}
			
			else {
				my.setFortePedal(false);
			}
			
			return;
		}
		
		APP.isFortePedalActive = pstat;
		
		SYNTH.handleFortePedalChange(pstat);
		
		GUI.updateFortePedalStatus(pstat);

	};
	
	
	my.panic = function(){
	
		SYNTH.panic();
	
	};


	my.loadPreset = function(preset){
	
		SYNTH.loadPreset(preset);
	
	};


	my.onMIDIInit = function(midi) {
		my.midiAccess = midi;
		console.log("MIDI initialized!");

		var inputs = my.midiAccess.inputs;
		
		if (inputs.size === 0){
			console.log("No MIDI input devices present.")
		}
		
		else { // Hook the message handler for all MIDI inputs
		
			console.log("MIDI initialized and ready. There are " + inputs.size + " inputs!");
			
			for (var input of inputs){
				console.log(input[1]);
				console.log("Found MIDI input: " + input[1].manufacturer + ", " + input[1].name);
				input[1].onmidimessage = my.MIDIMessageEventHandler;
			}
			
			
			
		}
	};
	

	my.onMIDIReject = function(err) {
		console.log("The MIDI system failed to start.");
	};
	

	my.MIDIMessageEventHandler = function(event) {
		console.log(event.data);
		// Mask off the lower nibble (MIDI channel, which we don't care about)
		switch (event.data[0] & 0xf0) {
		
			case 0x90:
				if (event.data[2] != 0) {  // if velocity != 0, this is a note-on message
					SYNTH.keystroke(event.data[1]-21, event.data[2]);
					return;
				}
				
				// if velocity == 0, fall thru: it's a note-off.  MIDI's weird, ya'll.
			case 0x80:
				SYNTH.keyUp(event.data[1]-21);
				return;
		}
		
		
		if ((event.data[0] == "176") && (event.data[1] == "64")){
		//if event is controller message and channel is 64 (sustain pedal)

			if (event.data[2] >= 64){
				my.setFortePedal(true);
			}
			
			else {
				my.setFortePedal(false);
			}
		
		}
		
		
	};
	
	my.setVolume = function(value){

		my.mastervolumeNode.gain.value = value/100;

	};


	my.loadBuffer = function(url,i){

		// create AJAX request
		var request=new XMLHttpRequest();
		request.open("GET",url,true);
		request.responseType="arraybuffer";

		// decode audio data when downloaded
		request.onload=function(){
			my.context.decodeAudioData(request.response,function(buffer){
				if(!buffer){alert('Das Sample konnte nicht dekodiert werden: '+url); return; };

				my.log("Decode sample file: " + i);

				//give current sample to piano buffer
				pianobuffer[i]=buffer;


				//refresh progress bar
				g('progress').value+=1/urls.length*100;

				//When done with loading
				if ((i+1)==urls.length) {
					g('controls').style.display='inline';
					g('footer').style.display='inline';

					my.log('Ready!');
				}

			});
		}; // end onload.function
		request.onerror=function(){alert('XMLHttpRequest not possible! Could not load sample.');};
		request.send();

	};
	
	
	my.handleKeyboardKeyDown = function(e) {
		
		var note=getnotefromkeycode(e.keyCode);
		
		if (note==-1) return;
		
		if (keydowns[note]==1) return;
		
		SYNTH.keystroke(getnotefromkeycode(e.keyCode));
		
		keydowns[note]=1;
	  
	}


	my.handleKeyboardKeyUp = function(e) {
	  
		var note = getnotefromkeycode(e.keyCode);
	  
		if (note==-1) return;
	  
		SYNTH.keyUp(getnotefromkeycode(e.keyCode));
	  
		keydowns[note]=0;
	  
	}


	var keydowns = Array(88);


	my.log = function(status){

		clearTimeout(my.statustimer);

		g("titleImgDIV").innerHTML = status;
		
		my.statustimer = setTimeout(my.showPlexLogo, 3000);
		
		console.log(status);

	};


	my.showPlexLogo = function(){

		g("titleImgDIV").innerHTML="<img alt='Plex' src='img/plex.png' id='plex' title='PLEX'>";

	}


	return my;

})();


window.addEventListener('DOMContentLoaded', APP.init, false);
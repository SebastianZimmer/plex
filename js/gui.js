var GUI = (function() {
	'use strict';

	var my = {};
	
	my.createKey = function(k, left, parent, isBlack){

		var button = dom.newElement("button", "b"+k, isBlack ? "blackkey" : "whitekey", parent);
		button.addEventListener("mousedown", function() { SYNTH.keystroke(k,1); });
		button.addEventListener("mouseup", function() { SYNTH.keyUp(k); });
		button.addEventListener("mouseout", function() { SYNTH.keyUp(k); });	
		
		button.style.left = left + "px";
		
		return button;


	}
	
	
	my.highlightKey = function(note){
	
		g("b" + (note)).style.backgroundColor = "red";
		
	};
	
	
	my.unhighlightKey = function(note){
		
		if (!g("b" + note)){
			return false;
		}

		g("b" + (note)).style.backgroundColor = "";
		
	}


	my.createOctave = function(id, start_key, parent, octave_left){

		var bw_keyorder = [false, true, false, true, false, false, true, false, true, false, true, false];

		var left = 0;
		
		var octave = dom.div(parent, id, "octave");
		
		for (var i = 0; i<12; i++){
		
			my.createKey(start_key + i, left, octave, bw_keyorder[i]);
			
			if (bw_keyorder[i] == true){ //black key width is 6
				left += 6;
			}
			
			else if (i==4){
				left += 20;
			}
			
			else {
				left += 14;
			}
			
		}
		
		octave.style.left = octave_left + "px";
		
	}


	my.createKeyboard = function(){

		var k = 0;
		var o = 0;
		
		var keyboard = dom.div(g("footer"), "keyboard", "keyboard");
		
		var o0 = dom.div(keyboard, "o0", "octave");
		o0.style.left = octaveLeft + "px";
		
		my.createKey(0, 0, o0, false);
		my.createKey(1, 14, o0, true);
		my.createKey(2, 20, o0, false);
		
		var octaveLeft=40;
		
		k=3;
		
		for (o=1; o<8; o++){
			my.createOctave("o1", k, keyboard, octaveLeft);
			
			octaveLeft += 140;
			
			k = k+12;
			
		}
		
		var o8 = dom.div(keyboard, "o8", "octave");
		o8.style.left = octaveLeft + "px";
		my.createKey(87, 0, o8);
		

	}
	
	
	
	my.updateVelocitySensitiveDisplay = function(stat){
		var color;
	
		if (stat == true){
			color = "#00FF00";
		}
		
		else {
			color = "#FF0000";
		}
		
		g(CONF.velocity_sensitivity_link_id).style.borderColor = color;
		
	};
	

	my.updateFXSlider = function(){

		g('chorus_rateSLIDER').value=SYNTH.chorus.rate;
		g('chorus_feedbackSLIDER').value=SYNTH.chorus.feedback;

		g('delay_feedbackSLIDER').value=SYNTH.delay.feedback.value;
		g('delay_timeSLIDER').value=SYNTH.delay.time;
		g('delay_wetSLIDER').value=SYNTH.delay.wetLevel.value;

		g('overdrive_driveSLIDER').value=SYNTH.overdrive.drive.value;
		g('overdrive_curveSLIDER').value=SYNTH.overdrive.curveAmount;
		g('overdrive_outputSLIDER').value=SYNTH.overdrive.outputGain.value;

		g('reverb_highcutSLIDER').value=reverb.highCut.value;
		g('reverb_lowcutSLIDER').value=reverb.lowCut.value;
		g('reverb_wetSLIDER').value=reverb.wetLevel.value;

	};

	
	my.displayActiveWaveform = function(waveform){

		g("LINK_no_wave_select").style.borderColor = "";
		g("LINK_sine_select").style.borderColor = "";
		g("LINK_square_select").style.borderColor="";
		g("LINK_sawtooth_select").style.borderColor="";
		g("LINK_triangle_select").style.borderColor=""; 
		g("LINK_custom_select").style.borderColor=""; 

		g("customwaveTABLE").style.display="none";
		
		if (g("LINK_" + waveform + "_select")){
			g("LINK_" + waveform + "_select").style.borderColor = "#00FF00";
		}
		
		if (waveform == "custom"){
		
			g("customwaveTABLE").style.display="block"; 
			my.updateHarmonicsSliders();
		}
		
		if (waveform == false){
			g("LINK_no_wave_select").style.borderColor="#00FF00";
		}

	};
	

	my.updateFortePedalStatus = function(pstat){
		var color;
		
		if (pstat == true){
			color = "#00FF00";
		}
		
		else {
			color = "#FF0000";
		}
		
		g(CONF.forte_pedal_link_id).style.borderColor = color;

	};

/*  to incorporate in mouseslider.js
	my.updateDetuneDisplay = function (value) {
	
		var detune_semitones = Math.floor(value);
		var detune_cents = Math.abs(Math.round(value % 1 *100));


		if (detune_semitones>=10){
		detune_semitones="+"+detune_semitones;
		}

		if ((detune_semitones>=0) && (detune_semitones<10)){
		detune_semitones="+0" + detune_semitones;
		}

		if ((detune_semitones<0) && (detune_semitones>-10)){
		detune_semitones="-0" + Math.abs(detune_semitones);
		}

		if (detune_semitones<=-10){
		detune_semitones="-"+Math.abs(detune_semitones);
		}


		if (detune_cents<10)
		detune_cents="0"+detune_cents;


		g('detuneDISP_semitones').innerHTML=detune_semitones;
		g('detuneDISP_cents').innerHTML=detune_cents;
		
	};*/
	
	
	my.updateHarmonicsLabels = function () {
	
		for (var i=0; i<7; i++){
		
			g('cd' + (i+1)).innerHTML="  "+OSC.active_oscillator.harmonics[i];
		
		}

		OSC.updateWaveformCanvas();

	};


	my.updateHarmonicsSliders = function () {
	
		for (var i=0; i<7; i++){
		
			g('cs' + (i+1)).value = OSC.active_oscillator.harmonics[i];
		
		}

		my.updateHarmonicsLabels();

	};
	
	return my;

})();

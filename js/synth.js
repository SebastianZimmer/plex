var SYNTH = (function () {
	'use strict';

	var my = {};
	
	my.masterTune;
	
	my.transposeValue = 0;
	
	my.fade_time_without_pedal = 0.1;
	my.fade_time_pedal = 2.5;

	my.lowpassfilter;
	my.highpassfilter;
	
	my.tuna;

	my.chorus;
	my.delay;
	my.overdrive;
	my.reverb;
	
	my.presets = [burning_church];
	
	
	my.init = function(){
	
		var effects = ["chorus", "delay", "overdrive", "reverb"];
		
		g("LINK_no_wave_select").addEventListener("click", function(){ OSC.setWaveformForActive(false); });
		g("LINK_sine_select").addEventListener("click", function(){ OSC.setWaveformForActive("sine"); });
		g("LINK_square_select").addEventListener("click", function(){ OSC.setWaveformForActive("square"); });
		g("LINK_sawtooth_select").addEventListener("click", function(){ OSC.setWaveformForActive("sawtooth"); });
		g("LINK_triangle_select").addEventListener("click", function(){ OSC.setWaveformForActive("triangle"); });
		g("LINK_custom_select").addEventListener("click", function(){ OSC.setWaveformForActive("custom"); });
		
		g('SLIDER_fx_chorus_feedback').addEventListener("input", my.getFXParametersFromSliders);
		g('SLIDER_fx_chorus_rate').addEventListener("input", my.getFXParametersFromSliders);
		g('SLIDER_fx_delay_feedback').addEventListener("input", my.getFXParametersFromSliders);
		g('SLIDER_fx_delay_time').addEventListener("input", my.getFXParametersFromSliders);
		g('SLIDER_fx_delay_wet').addEventListener("input", my.getFXParametersFromSliders);
		
		g('SLIDER_fx_overdrive_drive').addEventListener("input", my.getFXParametersFromSliders);
		g('SLIDER_fx_overdrive_curve').addEventListener("input", my.getFXParametersFromSliders);
		g('SLIDER_fx_overdrive_output').addEventListener("input", my.getFXParametersFromSliders);
		
		g('SLIDER_fx_reverb_highcut').addEventListener("input", my.getFXParametersFromSliders);
		g('SLIDER_fx_reverb_lowcut').addEventListener("input", my.getFXParametersFromSliders);
		g('SLIDER_fx_reverb_wet').addEventListener("input", my.getFXParametersFromSliders);
		
		my.showPresetsInSelect(my.presets);
		
		// create lowpass filter
		SYNTH.lowpassfilter = APP.context.createBiquadFilter();
		SYNTH.lowpassfilter.type = "lowpass";
		SYNTH.lowpassfilter.Q.value = 1;

		// create highpass filter
		SYNTH.highpassfilter = APP.context.createBiquadFilter();
		SYNTH.highpassfilter.type = "highpass";
		SYNTH.highpassfilter.Q.value = 1;
		
		SYNTH.setVelocitySensitivity(false);

		SYNTH.tuna = new Tuna(APP.context);

		SYNTH.chorus = new SYNTH.tuna.Chorus({
			rate: 1.5,         //0.01 to 8+
			feedback: 0.8,     //0 to 1+
			delay: 0.0045,     //0 to 1
			bypass: 1          //the value 1 starts the effect as bypassed, 0 or 1
		});                
		
		SYNTH.delay = new SYNTH.tuna.Delay({
			feedback: 0.45,    //0 to 1+
			delayTime: 150,    //how many milliseconds should the wet signal be delayed? 
			wetLevel: 0.25,    //0 to 1+
			dryLevel: 1,       //0 to 1+
			cutoff: 80,        //cutoff frequency of the built in highpass-filter. 20 to 22050
			bypass: 1
		});
		
		SYNTH.overdrive = new SYNTH.tuna.Overdrive({
			outputGain: 0.5,         //0 to 1+
			drive: 0.7,              //0 to 1
			curveAmount: 1,          //0 to 1
			algorithmIndex: 0,       //0 to 5, selects one of our drive algorithms
			bypass: 1
		});
		
		SYNTH.reverb = new SYNTH.tuna.Convolver({
			highCut: 22050,                         //20 to 22050
			lowCut: 20,                             //20 to 22050
			dryLevel: 1,                            //0 to 1+
			wetLevel: 1,                            //0 to 1+
			level: 1,                               //0 to 1+, adjusts total output of both wet and dry
			impulse: "impulses/impulse_rev.wav",    //the path to your impulse response
			bypass: 1
		});
		
		SYNTH.chorus.connect(SYNTH.delay.input);
		SYNTH.delay.connect(SYNTH.overdrive.input);
		SYNTH.overdrive.connect(SYNTH.reverb.input);
		SYNTH.reverb.connect(SYNTH.lowpassfilter);

		SYNTH.setMasterTune(440);
		SYNTH.setVelocitySensitivity(false);
		
		SYNTH.lowpassfilter.connect(SYNTH.highpassfilter);
		SYNTH.highpassfilter.connect(APP.mastervolumeNode);
		
		MOUSESLIDER({
			element: g("DISP_transpose"),
			sensitivity: 12,
			setterFunction: my.setTransposeValue,
			minValue: -12,
			maxValue: 12,
			startValue: 0,
			forceSign: true
		});
		
		MOUSESLIDER({
			element: g("DISP_tune"),
			sensitivity: 2,
			setterFunction: my.setMasterTune,
			minValue: 400,
			maxValue: 480,
			step: 0.1,
			startValue: 440,
			forceDecimals: true,
			decimals: 1,
			element_to_reset: g("fork")
		});
		
		MOUSESLIDER({
			element: g("DISP_LP"),
			sensitivity: 1,
			setterFunction: my.setLPValue,
			minValue: 20,
			maxValue: 20000,
			startValue: 20000,
			step: 2,
			minDigits: 5,
			curve: "exponential"
		});
		
		MOUSESLIDER({
			element: g("DISP_HP"),
			sensitivity: 1,
			setterFunction: my.setHPValue,
			minValue: 0,
			maxValue: 20000,
			startValue: 0,
			minDigits: 5,
			step: 2,
			curve: "exponential"
		});
		
		
		forEach(effects, function (effect){
		
			g("LINK_fx_"+effect).addEventListener("click", function(){my.switchFXPower(effect); });
			my.switchFXPower(effect);
			my.switchFXPower(effect);

		});
		
		OSC.init();
		
		console.log("OSCs initialized");
		
	};
	
	
	my.setLPValue = function(value){
	
		SYNTH.lowpassfilter.frequency.value = value;
	
	};
	
	
	my.setHPValue = function(value){
	
		SYNTH.highpassfilter.frequency.value = value;
	
	};
	
	
	my.showPresetsInSelect = function (presets){
	
		var select = g("SELECT_presets");
		
		if (!select){
			return;
		}
		
		dom.removeOptions(select);

		forEach(presets, function(preset){

			var NewOption = new Option(preset.name, preset.id, false, true);
			select.options[select.options.length] = NewOption;
			
		});
	
		select.selectedIndex = 0;
	
	
	};
	
	
	my.keyUp = function(note) {

		GUI.unhighlightKey(note);

		// set volume to 1 at current time
		forEach(OSC.oscillators, function(osc){

			var voice = osc.voices[note];
			
			if ((!voice.source) || (voice.source == null)){
				return;  //nothing to do
			}			
			
			if (APP.isFortePedalActive === true){
				// if fortepedal and synthesizer are on, do a slow exponential fade out
				my.fadeOutSlowly(voice);
			
			}
			
			else {
				my.fadeOutFast(voice);
			}
			
		});

	};
	
	
	my.fadeOutSlowly = function (voice){
	
		if (voice.FadeOutGainNode.gain.value == 1) {
			voice.FadeOutGainNode.gain.setValueCurveAtTime(APP.fadeOutCurve, APP.context.currentTime, my.fade_time_pedal);
		}
	
	};
	
	
	my.fadeOutFast = function(voice){
	
		
		if (!voice || !voice.FadeOutGainNode || voice.FadeOutGainNode.gain.value != 1){
			return;
		}
		
		voice.FadeOutGainNode.gain.setValueAtTime(1, APP.context.currentTime);
		voice.FadeOutGainNode.gain.linearRampToValueAtTime(0, APP.context.currentTime + my.fade_time_without_pedal);
	
	};
	
	
	my.handleFortePedalChange = function(pstat){
	
		if (pstat == false && OSC.active_oscillator){

			forEach(OSC.oscillators, function (osc){
			
				forEach(osc.voices, function(voice){
		
					var FOGN = voice.FadeOutGainNode;
				
					//stop all notes that are currently SLOWLY fading out
					if (FOGN && FOGN.gain.value != 1 && FOGN.gain.value != 0){
						my.fadeOutFast(voice);
					}
					
				});
			
			});
		
		}
	
	};


	my.stopSound_HARD = function(note) {
		
		if (!OSC.oscillators){
			return false;
		}
		
		forEach(OSC.oscillators, function(osc){
	
			if (osc.voices[note].source != null) {

				osc.voices[note].FadeOutGainNode.disconnect(0);
				
				osc.voices[note].source.stop(0);          
				osc.voices[note].source.disconnect(0);

				delete osc.voices[note].source;
				delete osc.voices[note].FadeOutGainNode;
			 
			}
			
			
		});

		GUI.unhighlightKey(note);
		
	}


	my.keystroke = function(note, velocity) {

		my.stopSound_HARD(note);

		GUI.highlightKey(note);
		
		if (APP.velocity_sensitive == 0) {   
			velocity = 127;
		}
		
		my.keystroke_synth(note, velocity);

	}


	my.keystroke_synth = function(note,velocity){
		
		forEach(OSC.oscillators, function(osc){

			if (osc.waveform != false){ // if oscillator is online
		
				if (APP.instrument == 0){
		
					var fileandpitch=getfileandpitch(note, my.transposeValue);

					if (fileandpitch.file == -1) {
						return false; //no sample found
					}

					// create a sound source node
					var source = APP.context.createBufferSource();
					// set playback rate
					source.playbackRate.value=fileandpitch.pitch;
					// load piano sample into source node    
					source.buffer = pianobuffer[fileandpitch.file];  
				
				}
				
				else {
					
					// create new oscillator node in source
					var source = APP.context.createOscillator(); 
					// determine frequency of tone
					source.frequency.value = getfrequency(note, osc.detune, my.masterTune, my.transposeValue); 
					
					// set waveform for oscillator
					if (osc.waveform != "custom") {
						source.type = osc.waveform; 
					}
					
					else {
						source.setPeriodicWave(osc.wavetable); 
					}

					// waveform shall be looped
					source.loop = true; 
				
				}

				// create a OSC.FadeOutGainNode
				var FOGN = APP.context.createGain();
				FOGN.gain.value = 1;
				
				// create velocity node
				var VN = APP.context.createGain();
				
				// set gain of VelocityNode
				VN.gain.value = 0.9 * velocity / 127 + 0.1;
				// as there are 127 different possible velocities in MIDI
				
				// connect source node to VelocityNode
				source.connect(VN);
				// connect NelocityNode to OSC.FadeOutGainNode
				VN.connect(FOGN); 

				FOGN.connect(osc.VolumeNode);
				
				osc.voices[note].source = source;
				osc.voices[note].FadeOutGainNode = FOGN;
				osc.voices[note].VelocityNode = VN;
				
				source.start(0);    // play the source now
			}

		});

	}

	
	my.setVelocitySensitivity = function(stat){
		
		if (stat == 2) {    //just change status
			
			if (APP.velocity_sensitive==0) {
				SYNTH.setVelocitySensitivity(1);
			}
			
			else {
				SYNTH.setVelocitySensitivity(0);
			}

			return;

		}
		
		SYNTH.panic();
		APP.velocity_sensitive = stat;
		
		GUI.updateVelocitySensitiveDisplay(stat);
		
	};
	
	
	my.switchFXPower = function (effect){
		
		my[effect].bypass =! my[effect].bypass;
		(my[effect].bypass==1) ? g(effect + 'TABLE').style.borderColor='red' : g(effect + 'TABLE').style.borderColor='lime';

	};


	my.getFXParametersFromSliders = function(){

		my.chorus.rate=g('SLIDER_fx_chorus_rate').value;
		my.chorus.feedback=g('SLIDER_fx_chorus_feedback').value;


		my.delay.feedback=g('SLIDER_fx_delay_feedback').value;
		my.delay.time=g('SLIDER_fx_delay_time').value;
		my.delay.wetLevel=g('SLIDER_fx_delay_wet').value;
		my.delay.dryLevel=1-g('SLIDER_fx_delay_wet').value;

		my.overdrive.drive.value = g('SLIDER_fx_overdrive_drive').value;
		my.overdrive.curveAmount = g('SLIDER_fx_overdrive_curve').value;
		my.overdrive.outputGain.value = g('SLIDER_fx_overdrive_output').value;

		my.reverb.highCut = g('SLIDER_fx_reverb_highcut').value;
		my.reverb.lowCut = g('SLIDER_fx_reverb_lowcut').value;

		my.reverb.wetLevel = g('SLIDER_fx_reverb_wet').value;
		my.reverb.dryLevel = 1 - g('SLIDER_fx_reverb_wet').value;
		
	};

	
	my.setMasterTune = function(value){

		my.masterTune = value;

	};
	
	
	my.setTransposeValue = function(value){

		my.transposeValue = value;

	};
	
	
	my.panic = function(){
	
		if (!OSC.oscillators){
			return false;
		}

		for (var j=0;j<88;j++){
			my.stopSound_HARD(j);
		}
		
		return true;

	};
	
	
	my.loadPreset = function(preset){
	
		console.log("Loading preset");
	
	};


	my.update_detune_disp = function () {

		var detune_semitones = Math.floor(OSC.oscillator[OSC.active_oscillator].detune);
		var detune_cents = Math.abs(Math.round(OSC.oscillator[OSC.active_oscillator].detune % 1 *100));


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

	};


	my.handleTuneSliderChange = function () {

		my.masterTune = g('SLIDER_mastertune').value;

		GUI.updateMasterTuneValueDisplay(my.masterTune);
	};

	
	return my;

})();

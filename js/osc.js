var OSC = (function () {

	var my = {};
	
	my.active_oscillator;
	
	my.curveLength2 = 1000;
	my.curve1 = new Float32Array(my.curveLength2);
	my.curve2 = new Float32Array(my.curveLength2);
	
	
	my.init = function(){
	
		g("LINK_oscselect0").addEventListener("click", function(){ OSC.setActive(0); });
		g("LINK_oscselect1").addEventListener("click", function(){ OSC.setActive(1); });
		g("LINK_oscselect2").addEventListener("click", function(){ OSC.setActive(2); });
		g("LINK_oscreset").addEventListener("click", function(){ OSC.resetActiveOSC(); });
	
		g('SLIDER_OSCRouting').addEventListener("input", function(){ my.setOSCRoutingValue();} );
		
		for (var i=0; i<7; i++){
		
			g("cs"+(i+1)).addEventListener("input", my.handleHarmonicsSliderChange);
		
		}
		
		my.createOSCs();
		
		MOUSESLIDER({
			element: g("DISP_detune_semitones"),
			sensitivity: 5,
			setterFunction: my.setDetune,
			minValue: -36,
			maxValue: 36,
			startValue: 0,
			minDigits: 2,
			forceSign: true
		});
		
		MOUSESLIDER({
			element: g("DISP_detune_cents"),
			sensitivity: 5,
			setterFunction: my.setDetune,
			minValue: 0,
			maxValue: 99,
			startValue: 0,
			minDigits: 2
		});
		
		MOUSESLIDER({
			element:g("DISP_OSCvolume"),
			sensitivity: 2,
			setterFunction: my.setOSCVolume,
			minValue: 0,
			maxValue: 100,
			startValue: 50,
			minDigits: 2
		});
	
	};
	

	my.createCustomWaveform = function () {

		for (var i = 0; i < my.curveLength2; i++){
			my.curve1[i] = 0;
		}
	
		for (var i = 7; i < my.curveLength2; i++){
			my.curve2[i]= my.active_oscillator.harmonics[6] /100/(2*i-1);    //square wave
		}
	 
		my.curve2[0] = 0;
		my.curve2[1] = my.active_oscillator.harmonics[0]/100;
		my.curve2[2] = my.active_oscillator.harmonics[1]/100;
		my.curve2[3] = my.active_oscillator.harmonics[2]/100;
		my.curve2[4] = my.active_oscillator.harmonics[3]/100;
		my.curve2[5] = my.active_oscillator.harmonics[4]/100;
		my.curve2[6] = my.active_oscillator.harmonics[5]/100;

		my.active_oscillator.wavetable = APP.context.createPeriodicWave(my.curve1, my.curve2);

	}


	my.setDetuneSemitones = function (value) {
	
		var detune_semitones = value;
		var detune_cents = g("DISP_detune_cents").value;

		if (detune_cents<10) detune_cents= "0" + detune_cents;

		my.active_oscillator.detune=parseFloat(detune_semitones+"."+detune_cents);

		APP.log("Detune: " + my.active_oscillator.detune);

	};
	
	
	my.setDetuneCents = function (value) {

		var detune_semitones = g("DISP_detune_demitones").value;
		var detune_cents = value;

		if (detune_cents<10) detune_cents= "0" + detune_cents;

		my.active_oscillator.detune=parseFloat(detune_semitones+"."+detune_cents);

		APP.log("Detune: " + my.active_oscillator.detune);

	};	


	my.getNewOSCObject = function(){
	
		var osc = {
			
			VolumeNode: undefined,
			RoutingNodes: [],
			waveform: false,
			wavetable: undefined,
			detune: 0,
			volume: 50,              //0-100
			filterpower: 0,
			lowcut_freq: 0,
			highcut_freq: 20000,
			harmonics: [],
			fx_routing: 0,
			voices: []
			
		};
		
		for (var jj=0;jj<7;jj++){
		
			osc.harmonics[jj]=0;
		   
		}
		
		osc.harmonics[0]=100;  
		
		for (var k=0; k<88; k++){
			
			osc.voices[k] = {
				source: undefined,
				FadeOutGainNode: undefined,
				VelocityNode: undefined,
			};
			
		}
		

		osc.VolumeNode = APP.context.createGain();        
		osc.VolumeNode.gain.value = osc.volume/100;
	 
		osc.RoutingNodes[0] = APP.context.createGain();  //To Master Section
		osc.RoutingNodes[1] = APP.context.createGain();  // To FX Section
		
		osc.RoutingNodes[0].gain.value=(100-osc.fx_routing)/100;    //To Master Section (100 at start)
		osc.RoutingNodes[1].gain.value=osc.fx_routing/100;         //To FX section (0 at start)

		osc.RoutingNodes[0].connect(SYNTH.lowpassfilter);
		osc.RoutingNodes[1].connect(SYNTH.chorus.input);

		// connect my.OSCVolumeNode to both Routing Nodes
		osc.VolumeNode.connect(osc.RoutingNodes[0]);
		osc.VolumeNode.connect(osc.RoutingNodes[1]);

		return osc;
	
	};


	my.createOSCs = function(){

		APP.log('Creating OSCs');
		
		my.oscillators = [];  // APP provides 3 oscillators

		for (var o=0; o<3; o++){
			
			my.oscillators[o] = my.getNewOSCObject();
	   
		}
	   
	   
		my.oscillators[0].waveform = "sine";
		
		my.setActive(0);

	};
	
	
	my.setOSCRoutingValue = function(value){

		var routing_slider = g('SLIDER_OSCRouting');
	
		if (!value){
		
			value = routing_slider.value;
			
		}
		
		my.active_oscillator.RoutingNodes[0].gain.value = (100-value)/100;     //To Master
		my.active_oscillator.RoutingNodes[1].gain.value = routing_slider.value/100;			//To FX

		my.active_oscillator.fx_routing = routing_slider.value;


		//update_fx_routing_slider();



		APP.log("Routing to FX: " + value + "%");

	};
	

	my.setOSCVolume = function (value) {

		my.active_oscillator.volume = value;
		my.active_oscillator.VolumeNode.gain.value = my.active_oscillator.volume/100; 

	};

	
	my.resetAllOSCs = function () {
		
		APP.log("Resetting all OSCs");
		
		my.resetOSC(0);
		my.resetOSC(1);
		my.resetOSC(2);
	
		my.setActiveOSC(0);

	};


	my.resetActiveOSC = function () {

		my.resetOSC(my.active_oscillator);

	}
	
	
	my.resetOSC = function(osc){
	
		APP.panic();

		osc = my.getNewOSCObject();
		
		my.setWaveformForActive(osc.waveform);
		
		GUI.updateHarmonicsSliders();

		APP.log('OSC reset');
	
	
	};


	my.resetDetuneValue = function () {

		my.active_oscillator.detune = 0;
		
		GUI.updateDetuneDisplay(my.active_oscillator.detune);

	};



	my.setActive = function(index){

		my.active_oscillator = my.oscillators[index];
		
		my.refreshActiveInGUI(index);
		
		console.log("active osc = " + index);

	};


	my.setWaveformForActive = function (waveform){

		SYNTH.panic();

		if (waveform == "custom") {
			my.createCustomWaveform();
		}

		my.active_oscillator.waveform = waveform;
		
		GUI.displayActiveWaveform(waveform);

	};
	

	my.handleHarmonicsSliderChange = function () {
	
		for (var i=0; i<7; i++){
		
			my.active_oscillator.harmonics[i] = g('cs' + (i+1)).value;
		
		}

		GUI.updateHarmonicsSliders();
		my.createCustomWaveform();

	};


	my.updateFXRoutingSlider = function () {

		g('SLIDER_OSCRouting').value = my.active_oscillator.fx_routing;

	};
	

	my.refreshActiveInGUI = function (index) {
	
		for (var o=0; o< my.oscillators.length; o++){
			g('LINK_oscselect' + o).style.backgroundColor="#0033FF";
			g('LINK_oscselect' + o).style.borderColor="";
		}

		g('LINK_oscselect' + index).style.backgroundColor = "#00CCFF";
		g('LINK_oscselect' + index).style.borderColor = "#00FF00";
		
		
		MOUSESLIDER({
			element: g("DISP_detune_semitones"),
			sensitivity: 5,
			setterFunction: my.setDetune,
			minValue: -36,
			maxValue: 36,
			startValue: Math.round(my.active_oscillator.detune),
			minDigits: 2,
			forceSign: true
		});
		
		MOUSESLIDER({
			element: g("DISP_detune_cents"),
			sensitivity: 5,
			setterFunction: my.setDetune,
			minValue: 0,
			maxValue: 99,
			startValue: my.active_oscillator.detune % 1,
			minDigits: 2
		});
		
		MOUSESLIDER({
			element:g("DISP_OSCvolume"),
			sensitivity: 2,
			setterFunction: my.setOSCVolume,
			minValue: 0,
			maxValue: 100,
			startValue: my.active_oscillator.volume,
			minDigits: 2
		});

		GUI.displayActiveWaveform(my.active_oscillator.waveform);

		my.updateFXRoutingSlider();

	};
	
	
	my.updateWaveformCanvas = function(){

		// Get a reference to the element.
		var elem = g('wavecanvas');
		var context = APP.context;

		// Always check for properties and methods, to make sure your code doesn't break 
		// in other browsers.
		if (elem && elem.getContext) {
			// Get the 2d context.
			// Remember: you can only initialize one context per element.
			var context = elem.getContext('2d');
			if (!context) {
				return;
			}
			
			//wavecanvas =400x200
			
			var length=400;
			var height=200;
			
			//clear canvas
			context.fillStyle  = '#0066FF';
			context.lineWidth  = 0;
			context.fillRect(0,0, length, height);


			var values = [];
			
			for(var v=0; v<7; v++){
			
				values[v] = 1.7 * my.active_oscillator.harmonics[v];
			
			}
			
			context.fillStyle  = '#f00'; // red
			context.lineWidth   = 0;
			
			var left = 35;
			
			for (var v=0; v<7; v++){
			
				context.fillRect(left, height-values[v], 25, values[v]);
				
				left += 50;
			
			}

			// Draw some rectangles.
			
			var x=1;
			
			for (var v=0; v<7; v++){			
			
				values[v] = my.active_oscillator.harmonics[v]/x;
				
				x += 2;
				
			}
			
			var curve = new Float32Array(400);
			
			var t = 400;
			var w = 2*Math.PI/t;
			
			for (var k=1;k<=curve.length;k++){
			
				
				curve[k]=
				values[0]*Math.sin(1*w*k)+
				values[1]*Math.sin(3*w*k)+
				values[2]*Math.sin(5*w*k)+
				values[3]*Math.sin(7*w*k)+
				values[4]*Math.sin(9*w*k)+
				values[5]*Math.sin(11*w*k)+
				values[6]*Math.sin(13*w*k);
				

				context.fillStyle = '#afa'; 
				context.fillRect(k, (-curve[k]/1.3+100), 3, 5);

			
			}
			
		
		
		}

	};
	
	
	return my;

})();

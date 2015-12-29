var burning_church = {

	id: "burning_church",
	name: "Burning Church",
	
	osc: [
		{
			waveform: 4,
			detune: 0,
			volume: 50,
			harmonics: [
				100,21,31,0,40,0,0
			],
			fx_routing: 100
		},
		{
			waveform: 0,
			detune: -12,
			volume: 100,
			harmonics: [
				0,0,0,0,0,0,0
			],
			fx_routing: 0
		},		
		{
			waveform: 4,
			detune: 12,
			volume: 50,
			harmonics: [
				480,0,0,0,0,6,0
			],
			fx_routing: 0
		}
	],
	
	fx: {
		chorus: {
			bypass: 0,
			feedback: 72,
			rate: 80
		},
		delay: {
			bypass: 1,
			feedback: 0,
			time: 0,
			wet: 1
		},
		overdrive: {
			bypass: 0,
			drive: 79,
			curve: 35,
			output: 100
		},
		reverb: {
			bypass: 0,
			hicut: 11875,
			locut: 280,
			wet: 50
		}
	}
};
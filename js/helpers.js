function g(id){

	return document.getElementById(id);
	
}


function forEach(array, action){

	for (var i=0; i<array.length; i++){
	
		action(array[i]);
	
	}


}


function getfileandpitch(note, transposeValue){

	var files = {

		1: {file:0, pitch:1},
		2: {file:0, pitch:1.05944},
		3: {file:1, pitch:0.94387},

		4: {file:1, pitch:1},
		5: {file:1, pitch:1.05944},
		6: {file:2, pitch:0.94387},
		7: {file:2, pitch:1},
		8: {file:2, pitch:1.05944},
		9: {file:3, pitch:0.94387},
		10: {file:3, pitch:1},
		11: {file:3, pitch:1.05944},
		12: {file:4, pitch:0.94387},
		13: {file:4, pitch:1},
		14: {file:4, pitch:1.05944},
		15: {file:5, pitch:0.94387},

		16: {file:5, pitch:1},
		17: {file:5, pitch:1.05944},
		18: {file:6, pitch:0.94387},
		19: {file:6, pitch:1},
		20: {file:6, pitch:1.05944},             //#20
		21: {file:7, pitch:0.94387},
		22: {file:7, pitch:1},
		23: {file:7, pitch:1.05944},
		24: {file:8, pitch:0.94387},
		25: {file:8, pitch:1},
		26: {file:8, pitch:1.05944},
		27: {file:9, pitch:0.94387},


		28: {file:9, pitch:1},
		29: {file:9, pitch:1.05944},
		30: {file:10, pitch:0.94387},
		31: {file:10, pitch:1},
		32: {file:10, pitch:1.05944},
		33: {file:11, pitch:0.94387},
		34: {file:11, pitch:1},
		35: {file:11, pitch:1.05944},
		36: {file:12, pitch:0.94387},
		37: {file:12, pitch:1},
		38: {file:12, pitch:1.05944},
		39: {file:13, pitch:0.94387},


		40: {file:13, pitch:1},
		41: {file:13, pitch:1.05944},
		42: {file:14, pitch:0.94387},
		43: {file:14, pitch:1},
		44: {file:14, pitch:1.05944},
		45: {file:15, pitch:0.94387},
		46: {file:15, pitch:1},
		47: {file:15, pitch:1.05944},
		48: {file:16, pitch:0.94387},
		49: {file:16, pitch:1},            //Klaviatur-Taste #49
		50: {file:16, pitch:1.05944},
		51: {file:17, pitch:0.94387},


		52: {file:17, pitch:1},
		53: {file:17, pitch:1.05944},
		54: {file:18, pitch:0.94387},
		55: {file:18, pitch:1},
		56: {file:18, pitch:1.05944},
		57: {file:19, pitch:0.94387},
		58: {file:19, pitch:1},
		59: {file:19, pitch:1.05944},
		60: {file:20, pitch:0.94387},
		61: {file:20, pitch:1},
		62: {file:20, pitch:1.05944},
		63: {file:21, pitch:0.94387},


		64: {file:21, pitch:1},
		65: {file:21, pitch:1.05944},
		66: {file:22, pitch:0.94387},
		67: {file:22, pitch:1},
		68: {file:22, pitch:1.05944},
		69: {file:23, pitch:0.94387},
		70: {file:23, pitch:1},
		71: {file:23, pitch:1.05944},
		72: {file:24, pitch:0.94387},
		73: {file:24, pitch:1},
		74: {file:24, pitch:1.05944},
		75: {file:25, pitch:0.94387},


		76: {file:25, pitch:1},
		77: {file:25, pitch:1.05944},
		78: {file:26, pitch:0.94387},
		79: {file:26, pitch:1},
		80: {file:26, pitch:1.05944},
		81: {file:27, pitch:0.94387},
		82: {file:27, pitch:1},
		83: {file:27, pitch:1.05944},
		84: {file:28, pitch:0.94387},
		85: {file:28, pitch:1},
		86: {file:28, pitch:1.05944},
		87: {file:29, pitch:0.94387},


		88: {file:29, pitch:1}
	}

	if (files[note+transposeValue]){

		return files[note+transposeValue];
		
	}

}



function getnotefromkeycode(keycode){

	var keycodes = {
		89: 28,  //Y
		83: 29,  //S
		88: 30,  //X
		68: 31,
		67: 32,
		86: 33,
		71: 34,
		66: 35,
		72: 36,
		78: 37,
		74: 38,
		77: 39,
		188: 40,
		76: 41,
		190: 42,
		192: 43,
		189: 44,
		81: 40,
		50: 41,
		87: 42,
		51: 43,
		69: 44,
		82: 45,
		53: 46,
		84: 47,
		54: 48,
		90: 49,
		55: 50,
		85: 51,
		73: 52,
		57: 53,
		79: 54,
		48: 55,
		80: 56,
		186: 57,
		221: 58,
		187: 59
	}

	if (keycodes[keycode]){
		return keycodes[keycode]-1;
	}

	else {
		return -1;
	}

}



function getfrequency(note, detune, masterTune, transpose){

	// note a with concert pitch is on key 49, since we start at key 0, it is key 48
	var power = note - 48 + transpose + detune;

	var frequency = masterTune * (Math.pow(2,(power/12)));

	return frequency;
	
}

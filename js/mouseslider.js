var MOUSESLIDER = function(options) {
//If you use this function on a DOM element with a number in it, the number will change
//when you click on the element and draw the mouse up or down.
//Furthermore, if setterFunction is defined, this function will be called with the new value


	var element = options.element;
	var pixels_for_value_change = options.sensitivity;
	var setterFunction = options.setterFunction;
	var minValue = options.minValue;
	var maxValue = options.maxValue;
	var minDigits = options.minDigits;
	var step = options.step;
	var forceDecimals = options.forceDecimals;
	var decimals = options.decimals;
	var forceSign = options.forceSign;
	var curve = options.curve;
	var startValue = options.startValue;
	var element_to_reset = options.element_to_reset;
	var separateSliders = options.separateSliders;
	
	var start_mouse_pos;
	var mouse_pos;
	var last_mouse_pos;
	
	if (!element){
		return false;
	}
	
	if (separateSliders && separateSliders == true){
	
		element.innerHTML = "";
	
		var span0 = document.createElement("span");
		element.appendChild(span0);
		
		var decimal_sign = document.createElement("span");
		element.appendChild(decimal_sign);
		decimal_sign.innerHTML = ".";
		
		var span1 = document.createElement("span");
		element.appendChild(span1);
	
	
	}
	
	
	if (element_to_reset){
		element_to_reset.addEventListener("click", function(){
			refreshValueInElement(element, startValue);
			setterFunction(startValue);
		});
		
		element_to_reset.style.cursor = "pointer";
	}
	
	//clone Node to remove all possible previous event listeners:
    var elClone = element.cloneNode(true);
	element.parentNode.replaceChild(elClone, element);
	
	element = elClone;
	
	element.style.cursor = "pointer";
	element.style.webkitUserSelect = "none";
	element.style.MozUserSelect = "none";
	
	element.addEventListener("mousedown", function(event) {
		mouse_pos = undefined;
		last_mouse_pos = undefined;
		
		start_mouse_pos = event.pageY;
	
		document.addEventListener("mousemove", handleMouseMove);
	  
		document.addEventListener("mouseup", function(){
			document.removeEventListener("mousemove", handleMouseMove);
		});
	});
	

	var handleMouseMove = function(e){
	
		last_mouse_pos = mouse_pos;
		mouse_pos = e.pageY;
		
		if (typeof last_mouse_pos == "undefined"){
			return;
		}
		
		if (mouse_pos % pixels_for_value_change == 0 || diff(mouse_pos, last_mouse_pos) > pixels_for_value_change){
	
			step = options.step;
	
			if (!step){
				step = 1;
			}
			
			
			if (diff(mouse_pos, start_mouse_pos) > 150){
				step = 2 * step;
			}
			
			
			if (mouse_pos > last_mouse_pos){
				adjustValue(element, -step, minValue, maxValue);  //when the mouse went down, decrease value
			}
			
			if (mouse_pos < last_mouse_pos){
				adjustValue(element, step, minValue, maxValue);	//when it went up, increase it
			}
		
		}
		
	};
	
	
	var refreshValueInElement = function(element, value){
		
		var abs_value = Math.abs(value);
		
		string = value.toString();
		
		if ((minDigits) && (abs_value.toString().length < minDigits)){
			
			var missing_zeros = diff(abs_value.toString().length, minDigits);
			
			if (value >= 0){
				for (var x=0; x<missing_zeros; x++){
					string = "0" + string;
				}

			}
			
			else {
				string = string.substr(1);
				
				for (var x=0; x<missing_zeros; x++){
					string = "0" + string;
				}
				
				string = "-" + string;
				
			}
		
		}
		
		if ((forceSign == true) && (value >= 0)){
			string = "+" + string;
		}
		
		if (forceDecimals == true && (value % 1 == 0)){
			string = string + ".";
			
			for (var d=0; d<decimals; d++){
				string += "0";
			}
		}
		
		element.innerHTML = string;
	
	};

	
	var adjustValue = function(element, diff, minValue, maxValue){
		var old_value = parseFloat(element.innerHTML);
		var new_value;
		
		if (curve && curve == "exponential"){
		
			var step = Math.round( 0.000005 * Math.pow(old_value, 1.75) );
			
			if (step < 1){
				step = 1;
			}
			
			new_value = old_value + (diff * step);
			
		}
		
		else {
		
			new_value = old_value + diff;
			
		}
		
		
		new_value = Math.round( new_value * 10 ) / 10; // to max. 1 decimal
		
		
		if (new_value < minValue) new_value = minValue;
		if (new_value > maxValue) new_value = maxValue;
	
		refreshValueInElement(element, new_value);
	
		if (setterFunction){
			setterFunction(new_value);
		}
		
	};
	
	
	var diff = function(v0, v1){
	
		return Math.abs(v0 - v1);
	
	};
	
	
	if (typeof startValue != "undefined"){
		refreshValueInElement(element, startValue);
	
		if (setterFunction){
			setterFunction(startValue);
		}
	
	
	}
	
	

};
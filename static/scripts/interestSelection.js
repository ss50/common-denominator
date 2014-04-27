
function c(x) {
	console.log(x);
}

//////////////

var input;
var timeout;
var timeoutTime = 1000;

window.addEventListener('load', function(){

	input = document.getElementById('input');

	input.addEventListener("input", inputChanged);

}, false);

function inputChanged(e) {
	// if no change for timeoutTime ms, get interests
	window.clearTimeout(timeout);
	timeout = window.setTimeout(getSuggestions, timeoutTime);
}

function getSuggestions(e) {
	if (input.value) {
		var req = new XMLHttpRequest();
		req.onload = function(e) {
			var suggestions = JSON.parse(req.response);
			// hey gadi, display these:
			c(suggestions);
		}
		req.open("get", "/LEDInterests/"+input.value, true);
		req.send();
	}
}







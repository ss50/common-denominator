navigator.geolocation.getCurrentPosition(gotten);

function gotten(position) {

	var lat = position.coords.latitude;
	var lon = position.coords.longitude;
	
	var dispStr = lat + ", " + lon;
	
	var s = document.querySelector("#show");
	s.innerHTML = "You are at " + dispStr;

}
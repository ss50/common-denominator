var latitude, longitude;

navigator.geolocation.getCurrentPosition(gotten);

function gotten(position) {

	latitude = position.coords.latitude;
	longitude = position.coords.longitude;
	
	var dispStr = lat + ", " + lon;
	
	var s = document.querySelector("#show");
	s.innerHTML = "You are at " + dispStr;

}

var latitude, longitude;

navigator.geolocation.getCurrentPosition(gotten);

function gotten(position) {

	latitude = position.coords.latitude;
	longitude = position.coords.longitude;
	
	var dispStr = lat + ", " + lon;
	
	var s = document.querySelector("#show");
	s.innerHTML = "You are at " + dispStr;

}

window.addEventListener('load', function(){
	var fd = new FormData();
	var signup_form = document.getElementById('sign_up_form');
	fd.append('latitude', latitude);
	fd.append('longitude', longitude);
	var request = new XMLHttpRequest();
	request.open('POST','/location');
	request.send(fd);

});
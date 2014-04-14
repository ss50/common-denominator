
window.addEventListener('load', function(){

	var login_form = document.getElementById('login_form');
	var redirect_form = document.getElementById('signup_redirect');
	var sign_up_form = document.getElementById('sign_up_form');

	var login_username = login_form.elements.namedItem("user_name");
	var sign_up_username = sign_up_form.elements.namedItem("user_name");
	var login_password = login_form.elements.namedItem("password");
	var sign_up_password = sign_up_form.elements.namedItem("signup_passwd");

	redirect_form.addEventListener('submit',function(e){
		e.preventDefault();
		login_form.style.display = "none";
		redirect_form.style.display = 'none';
		sign_up_form.style.display = "inline-block";

		sign_up_username.value = login_username.value;
		sign_up_password.value = login_password.value;
	});
}, false);


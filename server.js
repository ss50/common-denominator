//See README.md

var express = require('express');
var anyDB = require('any-db');
var shortId = require('shortid');
var conn = anyDB.createConnection('sqlite3://commondenominator.db');
var expressValidator = require('express-validator');
var connect = require('connect');
var fs = require('fs');
var app = express();
app.use(expressValidator());


var hbs = require('hbs');
var crypto = require('crypto');
app.set('view engine', 'html');
app.engine('html', hbs.__express);
app.set('views', __dirname + '/templates'); // tell Express where to find templates

// possibly change '/' to '/static'
app.use(express.bodyParser()); // definitely use this feature
app.use(express.methodOverride());
app.use(connect.static(__dirname + '/', { maxAge: 86400000 }));
app.use(express.cookieParser());

app.configure('development', function(){
	app.use(express.errorHandler());
	app.use(express.session({secret: 'secret session'}));
});

app.use(app.router);
// we may want to ignore anydb and just use this:
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("commondenominator.db");

///////////////////////////
///////////////////////////

function checkAuthorization(request,response,next)
	{
		/*
			For certain pages, it makes sense to redirect a user to the login page if the user is not logged in already.
			Examples: the nearby users page for the interests, add/remove an interest pages, adding a new interest, etc.
		*/
		if (!request.session.user_id){
		response.redirect('/login');
		}
	else{
		next();
		}
	}

function getHash(pwd){
	return crypto.createHash('md5').update(pwd).digest('hex');
}

// generates a user id 
function generateId(){
	var id = shortId.generate();
	var sql = 'SELECT * FROM users WHERE uid = $1'; // query to check if id has been used.
	var results = getRows(sql,id);

	while(results.length != 0){
		id = shortId.generate();
		results = getRows(sql,id);
	}

	return id;
}

function getRows(sql, id){
	var results = [];
	db.all(sql,[id],function(err, rows){
		rows.forEach(function(row){
			results.push(row);
		})
	});
	return results;
}

app.get('/favicon.ico', function(request, response) { console.log('favicon thrown out'); });

app.get('/',  checkAuthorization, function(request, response){
	var upic = "";
	
	conn.query('SELECT iurl FROM users WHERE uid = $1', 
				[request.session.user_id]).on('row', 
				function(row)
				{
					upic = row.iurl;
					console.log(upic);
				}).on('end',
						function()
						{
							if(upic=="") 
							{
								upic='http://www.faithlineprotestants.org/wp-content/uploads/2010/12/facebook-default-no-profile-pic.jpg';
							}
							var iList = "";
							conn.query('SELECT interest.intid AS iid, name, url FROM interest, intmemb WHERE interest.intid = intmemb.intid AND uid = $1',
								[request.session.user_id]).on('row',
									function(row)
									{
										iList += row.iid + "+" + 
												row.name + "+" +
												row.url + "&";
									}).on('end',
										function()
										{
											response.render('project.html', 
											{upic: upic, 
											myints: iList.substring(0, iList.length-1)});
										});
						});
});

app.post('/signup_redirect', function(request,response){
	response.redirect('/signup');
});

app.get('/signup', function(request,response){
	
	var allInt = "";
	conn.query('SELECT * FROM INTEREST').on('row', function(row) {
		allInt += row.intid + "+" + row.name + "+" + row.desc + "&";
		}).on('end', function() {
		response.render('signup.html', 
			{
				intList: allInt.substring(0, allInt.length-1)
			});
	}); 
});

app.post('/signup', function(request,response){
	var firstname = request.body.first_name;
	var lastname = request.body.last_name;
	var username = request.body.user_name;
	var password = request.body.signup_passwd;
	var reentered_pwd = request.body.reenter_passwd;
	request.assert('first_name', "First name is required").notEmpty();
	request.assert('last_name', "Last name is required").notEmpty();
	request.assert('user_name',"Username is required").notEmpty();
	request.assert('signup_passwd',"Password is required").notEmpty();
	request.assert('reenter_passwd', "Passwords do not match").equals(password);

	var errors = request.validationErrors();
	// errors in input
	if (errors){
		response.render('signup', {
			title: '',
			message: '',
			errors: errors,
			firstname: firstname,
			lastname: lastname,
			username: username 
		});
	}
	else{
		var sql = 'SELECT * FROM users WHERE firstname = $1 AND lastname = $2 AND uname = $3';
		db.get(sql,[firstname, lastname, username],function(err,row){
			if (row === undefined){// account doesn't exist so create new one
				// set session user_id
				//otherwise insert into database and redirect to profile
				var user_id = generateId();
				request.session.user_id = user_id;
				db.run('INSERT INTO users (uid, firstname, lastname, uname, password, loc, iurl) VALUES ($1,$2,$3,$4,$5, "0.0000, 0.0000", "http://www.faithlineprotestants.org/wp-content/uploads/2010/12/facebook-default-no-profile-pic.jpg")', 
					[user_id, firstname, lastname, username, getHash(password)] );
				console.log("Added new account to database");
				
				//dear dom, please handle adding selected interests in here SOMEHOW
				//input type checkbox?
				console.log(request.body.ints); //['4', '6', '7'] is the format here
				
				var indicated = request.body.ints;
				for(var i = 0; i < indicated.length; i++)
				{
					db.run('INSERT INTO intmemb (intid, uid, level) VALUES ($1, $2, 3)', [parseInt(indicated[i]), user_id]);
					console.log('Added new entry to membership table: ' + indicated[i] + ' for ' + user_id);
				}
				
				response.redirect('/');
				
			}
			else{
				errors = [{param: 'account_exists', msg: "An account already exists with this username"}];
				response.render('signup', {
					title: '',
					message: '',
					errors: errors,
					firstname: firstname,
					lastname: lastname,
					username: username
				});
			}
		});	
	}
});

app.get('/login',  function(request, response){
	response.render('login.html', {});
});

app.post('/login', function(request,response){
	var info = request.body;
	var username = "";
	var password = "";
	var user_id = "";
	var sql = 'SELECT uname, password,uid FROM users WHERE uname = $1 AND password = $2';
	var query = conn.query(sql,[info.user_name,getHash(info.password)]);
	var login_info = [];
	request.assert('user_name',"Username is required").notEmpty();
	request.assert('password', "Password is required").notEmpty();

	var errors = request.validationErrors();

	query.on('row',function(row){
		login_info.push(row);
		username = row.uname;
		password = row.password;
		user_id = row.uid;
	});
	query.on('end',function(end){
		 // if there was a match with the username and password
		if (login_info.length != 0){
			request.session.user_id = user_id;
			console.log(request.session.user_id);
			response.redirect("/");
		}
		else{
			// redirect back to login form and display errors
			username = request.body.user_name; // retain value of username after form has been submitted
			// if username and password don't match
			if (errors == null){
				errors = [{msg: "Invalid username and password"}]; 
			}
			// otherwise the fields were empty
			response.render('login', {
				title: '',
				message: '',
				errors: errors,
				username: username
			});
		}
	});	
});

app.post('/logout', function(request,response){
	request.session.destroy(function(){
		response.redirect('/login');
	});
});

app.post('/profile_pic', function(request,response){
	console.log(request.files);
	var uid = request.session.user_id;
	var photo_name = request.files.picture.name;
	var ext = photo_name.split('.')[1];
	var sql = 'UPDATE users SET iurl = $1 WHERE uid = $2';
	fs.readFile(request.files.picture.path,function(error,data){
		var file_name = uid + "." + ext;
		var server_path = "/static/images/users/" + file_name;
		fs.writeFile(server_path,data,function(error){
			db.run(sql,[server_path,uid]);
			response.redirect('/');
		});
	});
});

app.post('/contact', function(request,response){
	var email = request.body.email;
	var emailRE = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	var emailMatch = emailRE.test(email);
	
	var phone_number = request.body.phoneNumber;
	var phoneRE = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
	var phoneMatch = phoneRE.test(phone_number);

	if (emailMatch) {
		var sql = 'UPDATE users SET email = $1 WHERE uid = $2';
		db.run(sql,[email,request.session.user_id]);
	}
	if (phoneMatch) {
		var formatted = phone_number.replace(phoneRE, "$1$2$3");
		var sql = 'UPDATE users SET phone = $1 WHERE uid = $2';
		db.run(sql,[formatted,request.session.user_id]);
	}
	response.redirect('/');
	/*
	var regex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
	request.assert('email',"Invalid email").isEmail();
	request.assert('phoneNumber', 'Invalid phone number').matches(phone_number, regex.test());
	*/
});

app.post('/location', function(request,response){
	var latitude = request.body.latitude;
	var longitude = request.body.longitude;
	console.log(latitude);
	console.log(longitude);
	var coords = latitude + ',' + longitude;
	console.log(coords);
	var id = request.session.user_id;
	var sql = 'UPDATE users SET loc = $1 WHERE uid = $2';
	db.run(sql,[coords,id]);
	console.log('inserted location into database');
	response.redirect('/');
});

app.get('/messages', function(request, response){
	response.render('messages.html', {});
});


app.get('/select', function(request, response){
	response.render('interestSelection.html', {});

});


app.get('/user/me', checkAuthorization, function(request, response){	
	renderUser(request.session.user_id, request, response);
});

//view a user's page
app.get('/user/:uid', function(request, response){
	renderUser(request.params.uid, request, response);
});


function renderUser(uid, request, response){
	
	var intin;
	conn.query('SELECT uname, loc FROM users WHERE uid = $1', [uid]).on('row', 
		function(row) {
			//get information for this user
			var unm = row.uname;
			var ul = row.loc;
			
			intin = "";
			
			conn.query('SELECT name, intmemb.intid AS iid, level  FROM interest, intmemb WHERE interest.intid = intmemb.intid AND intmemb.uid = $1', [uid]).on('row',
				//get this user's interests
				function(row){
				intin += row.name +'+'+ row.iid +'+'+ row.level + '&';
				}
			).on('end', 
				function()
				{
					
					response.render('userpage.html', 
						{uid: uid, 
						usrnm: unm, 
						uloc: ul, 
						uints: intin.substring(0, intin.length-1)});
				});
			
				});
	
	
	
	
	
}

app.get('/interest/addinterest', checkAuthorization, function(request, response){
	response.render('addinterest.html', {});
	
});

//add a new user-defined interest
app.post('/interest/addinterest', function(request, response){
	response.render('addinterest.html', {});
	
	
	var info = request.body;
	var name = info.intname;
	var desc = info.desc;
	
	conn.query('INSERT INTO interest (name, desc) VALUES ($1, $2)', [name, desc]).on('end', function() {console.log(name + ' added to interests table');});
});		

//show all interests
app.get('/interest/all', function(request, response){
	var allInt = "";
	conn.query('SELECT * FROM INTEREST').on('row', function(row) {
		allInt += row.intid + "+" + row.name + "+" + row.desc + "&";
		}).on('end', function() {
		response.render('allinterests.html', 
			{intList: allInt.substring(0, allInt.length-1)});
	}); 
});



app.get('/interest/:iid/near', checkAuthorization, function(request, response) {
	
	//response.writeHead(200, {'Content-Type': 'text/html'});
	var userDist = "", udArr, lat, lon, nearby = "";
	var intNm = "";
	
	conn.query('SELECT name FROM interest WHERE intid = $1', [request.params.iid]).on('row', function(row) {intNm = row.name;});
	
	conn.query('SELECT loc FROM users WHERE uid = $1', [request.session.user_id]).on('row', 
		function(row) {
		
				//obtain the source user's location, process latitude/longitude
				userDist = row.loc; 
				udArr = userDist.split(",");
				lat = parseFloat(udArr[0]) * 1000;
				lon = parseFloat(udArr[1]) * 1000;
				
				});
				
				
				var nUsers = "";
				conn.query('SELECT uname, loc, users.uid AS uid, level '+
							'FROM users, intmemb WHERE users.uid != $1 AND intid = $2 AND users.uid = intmemb. uid', 
							['TEST', request.params.iid]).on('row',
					function(row)
					{	
						//for all other users, process distance from source user
						var oArr = row.loc.split(",");
						var oLat = parseFloat(oArr[0]) * 1000;
						var oLon = parseFloat(oArr[1]) * 1000;
						var dist = getDist(lat, lon, oLat, oLon);
						//console.log(dist);
						
						if(dist < 12) //tweakable
							nearby += row.uname + "+" + row.uid + "+" + row.level + "&";
						
						//calculate distance!
					
					}).on('end', function() {
							//render results
							response.render('near.html', {name: intNm, 
															iid: request.params.iid, 
															prox: nearby.substring(0, nearby.length-1)});
					});

});

//quick distance calculator; assuming euclidean distances
function getDist(lat, lon, oLat, oLon) {

	var xS = Math.pow((lat - oLat), 2);
	var yS = Math.pow((lon - oLon), 2);
	
	var dist = Math.sqrt(xS + yS);
	return dist;
}


//aww, this user isn't into this interest anymore
app.get('/interest/:iid/remove', checkAuthorization, function(request, response)
{
	console.log('interest removal');
	var inm = "";
	conn.query('SELECT name FROM interest WHERE intid = $1', 
			   [request.params.iid]).on('row', 
			function(row) 
			{
				inm = row.name; //should only be one result for this given unique interest ids
			}).on('end', 
				  function()
				  {
					//render the removal page
					  response.render('remove.html', {intname: inm});
				  });
	
});

//thank goodness post requests can help us run these sql queries
app.post('/interest/:iid/remove', function(request, response)
{
	console.log('going through with the removal');
	conn.query('DELETE FROM intmemb WHERE intid = $1 AND uid = $2', [request.params.iid, request.session.user_id]).on('end',
					function()
					{
						//upon removing the membership entry, redirect the user to the interest page
						response.redirect('/interest/' + request.params.iid);
					});

});

//page allowing user to confirm adding an interest to their list of interests, indicating interest level
app.get('/interest/:iid/add', checkAuthorization, function(request, response)
{
	conn.query('SELECT name FROM interest WHERE intid = $1', [request.params.iid]).on('row', function(row) {
	response.render('addinterest-individual.html', {intname: row.name});});
});

app.post('/interest/:iid/add', function(request, response) 
{
	//intid, uid, level
	var info = request.body;
	var id = request.params.iid;
	var level = info.level;
	
	//insert into membership table
	conn.query('INSERT INTO intmemb (intid, uid, level) VALUES ($1, $2, $3)', [id, request.session.user_id, level]).on('end', 
		function() 
		{
			console.log('adding new entry to intmemb table with level ' + level);
			//take user back to the main page for the interest
			response.redirect('/interest/' + request.params.iid);
		});
});

function checkAuthorizationInterest(request,response,next){
	if (!request.session.user_id){
	
		var uList = "";
		var randInt = "";
		var present = 0;
		
		//show a version without the add/remove buttons
		conn.query('SELECT name, desc, url FROM interest WHERE intid = $1', [request.params.iid]).on('row', 
		function(row) {
			//console.log(row);
			var iname = row.name;
			var idesc = row.desc;
			var iurl = row.url;
			var likes = '';
			
			//get everyone who likes this interest
			conn.query('SELECT uname, level, users.uid FROM users, intmemb WHERE users.uid = intmemb.uid AND intmemb.intid = $1 ORDER BY level DESC', [request.params.iid]).on('row', function(row) {
				uList += row.uid + "+" + row.uname + "+" + row.level + "&";
			
			}).on('end', function() {
				
				//show six other randomized interests
				conn.query('SELECT * FROM interest WHERE intid != $1 ORDER BY RANDOM() LIMIT 6', [request.params.iid]).on('row', function(row) {
				
				randInt += row.desc + "+" + row.intid + "+" + row.name + "&";
					
				}).on('end', function(){
							response.render('intpage-nolog.html', 
											{intName: iname, 
											intid: request.params.iid, 
											intDesc: idesc, 
											userList: uList.substring(0, uList.length-1), 
											randoms: randInt.substring(0, randInt.length-1), 
											img: iurl});
									});
				
				});
			
			
			});
	}
	else{
		next();
	}
}

app.post('/interest_search/:iid',checkAuthorizationInterest,function(request,response){
	var name = request.body.user_by_name.split(' ');
	var first_name = name[0];
	var last_name = name[1];
	var id = request.params.iid;
	var sql;
	var names = [];
	var user_ids = [];
	var results = [];
	console.log(first_name);
	console.log(last_name);
	if (first_name !== undefined && last_name !== undefined){
		sql = 'SELECT * FROM users WHERE firstname = $1 AND lastname = $2';
		console.log("Both first and last name");
		names = [first_name,last_name];
		console.log(names);
		db.all(sql,names,function(error,rows){
			console.log(rows);
			if(rows !== undefined){
				rows.forEach(function(row){
					user_ids.push(row);
				});
			}
		});
	}
	else if (first_name !== undefined && last_name === undefined){
		sql = 'SELECT * FROM users WHERE firstname = $1 OR lastname=$1';
		console.log("Only one name given");
		names = [first_name];
		console.log(names);
		db.all(sql,names,function(error,rows){
			console.log(rows);
			if(rows !== undefined){
				rows.forEach(function(row){
					user_ids.push(row);
				});
			}
			
		});
	}
	else{
		//error handling
		console.log("Field left blank");
	}
	console.log("List of user ids:" + user_ids);
	
	
	for (var i = 0; i < user_ids.length; i++){
		var user_id = user_ids[i].uid;
		var sql = 'SELECT * FROM intmemb WHERE intid = $1 AND uid = $2';
		fields = [id,user_id];
		db.get(sql,fields,function(err,rows){
			if(rows !== undefined){
				results.push(user_ids[i]);
			}
		})
	}
	console.log("Results: " + results);
	
});

//detail page for a single interest
app.get('/interest/:iid', checkAuthorizationInterest, function(request, response){

	var uList = "";
	var randInt = "";
	var has = "";
	var present = 0;
	
	//uid TEST is obviously for testing purposes to simulate the presence of a logged-in user
	conn.query('SELECT * FROM intmemb WHERE intid = $1 AND uid = $2', [request.params.iid, request.session.user_id]).on('row',
					function(row){console.log('hey');present += 1;}).on('end', 
						function()
						{
							if(present == 0) //user does not have this interest on their list
							{
								console.log('nope');
								has = "no";
							}
							else //interest present
							{
								console.log('right here');
								has = "yes";
							}
						});
	
	
	
	
	//get info for this interest
	conn.query('SELECT name, desc, url FROM interest WHERE intid = $1', [request.params.iid]).on('row', 
		function(row) {
			//console.log(row);
			var iname = row.name;
			var idesc = row.desc;
			var iurl = row.url;
			var likes = '';
			
			//get everyone who likes this interest
			conn.query('SELECT uname, level, users.uid, iurl FROM users, intmemb WHERE users.uid = intmemb.uid AND intmemb.intid = $1 ORDER BY level DESC', [request.params.iid]).on('row', function(row) {
				var uimg = row.iurl + "";
				if(uimg=="")
					uimg = "http://www.faithlineprotestants.org/wp-content/uploads/2010/12/facebook-default-no-profile-pic.jpg";
				uList += row.uid + "+" + row.uname + "+" + row.level + "+" + uimg + "&";
			
			}).on('end', function() {
				
				//show six other randomized interests
				conn.query('SELECT * FROM interest WHERE intid != $1 ORDER BY RANDOM() LIMIT 6', [request.params.iid]).on('row', function(row) {
				
				randInt += row.desc + "+" + row.intid + "+" + row.name + "&";
					
				}).on('end', function(){
					//console.log("List of users with this interest" + uList.substring(0, uList.length-1));
					//console.log("Random shit: " + randInt.substring(0, randInt.length-1));
					response.render('interest.html', 
					{intName: iname, 
					intid: request.params.iid, 
					intDesc: idesc, 
					userList: uList.substring(0, uList.length-1), 
					randoms: randInt.substring(0, randInt.length-1), 
					img: iurl, 
					existent: has});
					});
				
				});
			
			
			});
});

app.get('/geo', function(request, response){
	response.render('geo.html', {});
	});

//style the error page better		
app.get('/*', function(request, response) {
		//console.log('error');
		response.render('error.html', {});
	});

		
//Visit localhost:8080
app.listen(8080, function() { console.log(' - listening on port 8080');});
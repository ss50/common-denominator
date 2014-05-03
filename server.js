//See README.md

var express = require('express');
var RedisStore = require('connect-redis')(express);
var redis = require("redis");
var client = redis.createClient();
var anyDB = require('any-db');
var conn = anyDB.createConnection('sqlite3://commondenominator.db');
var expressValidator = require('express-validator');
var connect = require('connect');
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
app.use(express.session({secret: "secret session", store: new RedisStore(
	{host: '127.0.0.1', port: 6379, client: client}
	)}));
app.use(app.router);


app.configure('development', function(){
	app.use(express.errorHandler());
});

// we may want to ignore anydb and just use this:
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("commondenominator.db");

///////////////////////////
///////////////////////////

function checkAuthorization(request,response,next){
	if (!request.session.user_id){
		response.redirect('/*');
	}
	else{
		next();
	}
}

function getHash(pwd){
	return crypto.createHash('md5').update(pwd).digest('hex');
}

app.get('/favicon.ico', function(request, response) { console.log('favicon thrown out'); });

app.get('/',  checkAuthorization, function(request, response){
	response.render('project.html', {});
});

app.post('/signup_redirect', function(request,response){
	response.redirect('/signup');
});

app.get('/signup', function(request,response){
	response.render('signup.html', {});
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

app.get('/messages', function(request, response){
	response.render('messages.html', {});
});


app.get('/select', function(request, response){
	response.render('interestSelection.html', {});

});

app.get('/user/:uid/near', function(request, response) {
	
	//response.writeHead(200, {'Content-Type': 'text/html'});
	var userDist = "", udArr, lat, lon, uname, nearby = "";
	conn.query('SELECT uname, loc FROM users WHERE uid = $1', [request.params.uid]).on('row', 
		function(row) {
		
				//obtain the source user's location, process latitude/longitude
				uname = row.uname;
				userDist = row.loc; 
				udArr = userDist.split(",");
				lat = parseFloat(udArr[0]) * 1000;
				lon = parseFloat(udArr[1]) * 1000;
				
				});
				
				
				var nUsers = "";
				conn.query('SELECT uname, loc, uid FROM users WHERE uid != $1', [request.params.uid]).on('row',
					function(row)
					{	
						//for all other users, process distance from source user
						var oArr = row.loc.split(",");
						var oLat = parseFloat(oArr[0]) * 1000;
						var oLon = parseFloat(oArr[1]) * 1000;
						var dist = getDist(lat, lon, oLat, oLon);
						//console.log(dist);
						
						if(dist < 12) //tweakable
							nearby += row.uname + "+" + row.uid + "&";
							//response.write('<li><a href="/user/'+row.uid+'">'+row.uname+'</a></li>');
						
						//calculate distance!
					
					}).on('end', function() {
							//render results
							response.render('near.html', {usrnm: uname, uid: request.params.uid, prox: nearby.substring(0, nearby.length-1)});
					});

});

//quick distance calculator; assuming euclidean distances
function getDist(lat, lon, oLat, oLon) {

	var xS = Math.pow((lat - oLat), 2);
	var yS = Math.pow((lon - oLon), 2);
	
	var dist = Math.sqrt(xS + yS);
	return dist;
}

app.get('/user/:uid', function(request, response){
	
	var intin;
	conn.query('SELECT uname, loc FROM users WHERE uid = $1', [request.params.uid]).on('row', 
		function(row) {
			//console.log(row);
			//get information for this user
			var unm = row.uname;
			var ul = row.loc;
			
			intin = "";
			
			conn.query('SELECT name, intmemb.intid AS iid, level  FROM interest, intmemb WHERE interest.intid = intmemb.intid AND intmemb.uid = $1', [request.params.uid]).on('row',
				//get this user's interests
				function(row){
				intin += row.name +'+'+ row.iid +'+'+ row.level + '&';
				}
			).on('end', 
				function()
				{
					//view nearby users
					response.render('userpage.html', {uid: request.params.uid, usrnm: unm, uloc: ul, uints: intin.substring(0, intin.length-1)});
				});
			
				});
	
	
	
	
	
});

app.get('/interest/addinterest', function(request, response){
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

//detail page for a single interest
app.get('/interest/:iid', function(request, response){

	var uList = "";
	var randInt = "";
	
	//get info for this interest
	conn.query('SELECT name, desc FROM interest WHERE intid = $1', [request.params.iid]).on('row', 
		function(row) {
			//console.log(row);
			var iname = row.name;
			var idesc = row.desc;
			var likes = '';
			
			//get everyone who likes this interest
			conn.query('SELECT uname, level, users.uid FROM users, intmemb WHERE users.uid = intmemb.uid AND intmemb.intid = $1 ORDER BY level DESC', [request.params.iid]).on('row', function(row) {
				uList += row.uid + "+" + row.uname + "+" + row.level + "&";
			
			}).on('end', function() {
				
				//show six other randomized interests
				conn.query('SELECT * FROM interest ORDER BY RANDOM() LIMIT 6').on('row', function(row) {
				
				randInt += row.desc + "+" + row.intid + "+" + row.name + "&";
					
				}).on('end', function(){
							response.render('intpage.html', {intName: iname, intDesc: idesc, userList: uList.substring(0, uList.length-1), randoms: randInt.substring(0, randInt.length-1)});
									});
				
				});
			
			
			});
		});

// virtual tables can't be stored
db.loadExtension('spellfix', function(error) {
	if (error) {
		console.log("-error loading spellfix extension");
		console.log(error);
	} else {
		console.log("-loaded spellfix extension");
		
		db.all("SELECT word FROM spellfix WHERE top=1;", function(err, rows) {
			if (!rows) {
				db.serialize(function() {
					db.run('CREATE VIRTUAL TABLE IF NOT EXISTS spellfix USING spellfix1;');
					console.log('-spellfix table created');

					db.run('INSERT INTO spellfix(word) SELECT name FROM interest;');
					console.log('--All interests inserted into spellfix');
				});
			}
	    });
	}
});

app.get('/LEDInterests/:interest', function(request, response){
	var interest = request.params.interest;
	db.all("SELECT word FROM spellfix WHERE word MATCH '"+interest+"' AND top=5;", function(err, rows) {
		var words = [];
        rows.forEach(function (row) {
            words.push(row.word);
        });
		response.json(words);
    });
});

app.get('/geo', function(request, response){
	response.render('geo.html', {});
	});

//style the error page better		
app.get('/*', function(request, response) {
		console.log('error');
		response.render('error.html', {});
		});

		
//Visit localhost:8080
app.listen(8080, function() { console.log(' - listening on port 8080');});
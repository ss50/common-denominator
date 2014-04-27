//See README.md

var express = require('express');
var anyDB = require('any-db');
var conn = anyDB.createConnection('sqlite3://commondenominator.db');
var expressValidator = require('express-validator');
var connect = require('connect');
var app = express();
app.use(express.bodyParser()); // definitely use this feature
app.use(expressValidator());

var hbs = require('hbs');
var crypto = require('crypto');
app.set('view engine', 'html');
app.engine('html', hbs.__express);
app.set('views', __dirname + '/templates'); // tell Express where to find templates

// possibly change '/' to '/static'
app.use(connect.static(__dirname + '/', { maxAge: 86400000 }));
app.use(express.cookieParser());
app.use(express.methodOverride());
app.use(express.session({secret:"Secret session"}));
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

	//console.log(errors);
	console.log('in login post');

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
	
	response.writeHead(200, {'Content-Type': 'text/html'});
	var userDist = "", udArr, lat, lon;
	conn.query('SELECT uname, loc FROM users WHERE uid = $1', [request.params.uid]).on('row', function(row) {userDist = row.loc; udArr = userDist.split(",");
	lat = parseFloat(udArr[0]) * 1000;
	lon = parseFloat(udArr[1]) * 1000;
	console.log(lat);
	response.write('<h2>These users are near ' + row.uname + ':</h2><ul>');});
	
	
	
	conn.query('SELECT uname, loc, uid FROM users WHERE uid != $1', [request.params.uid]).on('row',
		function(row)
		{
			var oArr = row.loc.split(",");
			var oLat = parseFloat(oArr[0]) * 1000;
			var oLon = parseFloat(oArr[1]) * 1000;
			
			var xS = Math.pow((lat - oLat), 2);
			var yS = Math.pow((lon - oLon), 2);
			
			var dist = Math.sqrt(xS + yS);
			console.log(dist);
			
			if(dist < 12) //tweakable
				response.write('<li><a href="/user/'+row.uid+'">'+row.uname+'</a></li>');
			
			//calculate distance!
		
		}).on('end', function() {response.end('</ul>');});

});

app.get('/user/:uid', function(request, response){
	console.log(request.params.uid);
	var intin;
	conn.query('SELECT uname, loc FROM users WHERE uid = $1', [request.params.uid]).on('row', 
		function(row) {
			console.log(row);
			var usrnm = row.uname;
			response.writeHead(200, {'Content-Type': 'text/html'});
			response.write('<title>Details for ' + usrnm + '</title>'
			+ '<h2>Where is ' + usrnm + '?</h2><p>' + usrnm + ' is at ' + row.loc 
			+ '.</p>'+'<h2>What is ' + usrnm + ' interested in?</h2><p>'); 
			//var intarr = row.intr.split(",");
			intin = "";
			
			conn.query('SELECT name, intmemb.intid AS iid, level  FROM interest, intmemb WHERE interest.intid = intmemb.intid AND intmemb.uid = $1', [request.params.uid]).on('row',
				
				function(row){console.log(row);response.write('<li><a href="/interest/'+ row.iid + '">' + row.name + '</a> (Interest level: '+row.level+')</li>');}
			).on('end', 
				function()
				{
					//view nearby users?
					response.write('<br><a href="/user/' + request.params.uid + '/near">Who is near ' + usrnm + '?</a>');
					response.end();
				});
			
				});
	
});

app.get('/interest/addinterest', function(request, response){
	response.render('addinterest.html', {});
	
});

app.post('/interest/addinterest', function(request, response){
	response.render('addinterest.html', {});
	console.log('it\'s happening');
	
	var info = request.body;
	var name = info.intname;
	var desc = info.desc;
	
	console.log(name);
	conn.query('INSERT INTO interest (name, desc) VALUES ($1, $2)', [name, desc]).on('end', function() {console.log(name + ' added to interests table');});
});		

app.get('/interest/all', function(request, response){
	response.writeHead(200, {'Content-Type': 'text/html'});
	response.write('<h1>Browse all the interests. Go ahead.</h1><ul>');
	conn.query('SELECT * FROM interest').on('row', 
	function(row) 
	{
	
		response.write('<li><a href="/interest/' + row.intid + '">' + row.name + '</a>: ' + row.desc + '</li>');
	
	}).on('end', function(){response.end('</ul><a href="/interest/addinterest">Add an interest</a>');});
		
});

app.get('/interest/:iid', function(request, response){
	console.log(request.params.iid);
	conn.query('SELECT name, desc FROM interest WHERE intid = $1', [request.params.iid]).on('row', 
		function(row) {
			console.log(row);
			
			response.writeHead(200, {'Content-Type': 'text/html'});
			response.write('<title>' + row.name + '</title><h1>' + row.name + ": " + row.desc //+ '.</h1>');
			+ '.</h1><h2>Who likes it?</h2><ul>');
			var likes = '';
			conn.query('SELECT uname, level, users.uid FROM users, intmemb WHERE users.uid = intmemb.uid AND intmemb.intid = $1 ORDER BY level DESC', [request.params.iid]).on('row', function(row) {
				console.log(row);
				likes = likes + '<li><a href="/user/' + row.uid + '">' + row.uname + '</a> (Interest level: '+row.level+')</li>';
			
			}).on('end', function() {
			
			
				console.log('These folks do: ' + likes)
				response.write(likes);
				response.write('<p>see other interests: ');
				
				conn.query('SELECT * FROM interest ORDER BY RANDOM() LIMIT 6').on('row', function(row) {
				
				response.write('| <span title="' + row.desc + '"><a href="/interest/' + row.intid + '">' + row.name + '</a></span> ');
					
				}).on('end', function(){response.end(' |</p><br><a href="/interest/all">View all interests</a><br><a href="/interest/addinterest">Add an interest</a>');});
				
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

		
app.get('/*', function(request, response) {
		response.writeHead(200, {'Content-Type': 'text/html'});
		response.write('<h1>Whoa there!</h1><p>Page not found. Check the URL maybe?</p>');
		response.end();
		});

		
//Visit localhost:8080
app.listen(8080, function() { console.log(' - listening on port 8080');});
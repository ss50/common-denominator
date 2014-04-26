//See README.md

var express = require('express');
var anyDB = require('any-db');
var conn = anyDB.createConnection('sqlite3://commondenominator.db');
var expressValidator = require('express-validator');
var connect = require('connect');
var app = express();
app.use(express.bodyParser()); // definitely use this feature

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
app.use(expressValidator);

app.configure('development', function(){
	app.use(express.errorHandler());
});

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
	console.log('in login post');

	query.on('row',function(row){
		login_info.push(row);
		username = row.uname;
		password = row.password;
		user_id = row.uid;
	});
	query.on('end',function(end){
		 // if there was a match with the username and password
		console.log(login_info);
		if (login_info.length != 0){
			console.log("passed");
			request.session.user_id = user_id;
			console.log(request.session.user_id);
			console.log("Username: " + username + " password: " + password + " user_id: " + user_id);
			response.redirect("/");
		}
		else{
			// redirect back to login form and display errors
			response.render('login.html');
		}
		
	});
	
});

app.get('/messages', function(request, response){
	response.render('messages.html', {});
});

app.get('/user/:uid', function(request, response){
	console.log(request.params.uid);
	var intin;
	conn.query('SELECT uname, loc FROM users WHERE uid = $1', [request.params.uid]).on('row', 
		function(row) {
			console.log(row);
			
			response.writeHead(200, {'Content-Type': 'text/html'});
			response.write('<title>Details for ' + row.uname + '</title>'
			+ '<h2>Where is ' + row.uname + '?</h2><p>' + row.uname + ' is at ' + row.loc 
			+ '.</p>'+'<h2>What is ' + row.uname + ' interested in?</h2><p>'); 
			//var intarr = row.intr.split(",");
			intin = "";
			
			conn.query('SELECT name, intmemb.intid AS iid, level  FROM interest, intmemb WHERE interest.intid = intmemb.intid AND intmemb.uid = $1', [request.params.uid]).on('row',
				
				function(row){console.log(row);response.write('<li><a href="/interest/'+ row.iid + '">' + row.name + '</a> (Interest level: '+row.level+')</li>');}
			).on('end', 
				function()
				{
					//view nearby users?
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
	
	}).on('end', function(){response.end('</ul>');});
		
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
			conn.query('SELECT uname, level, users.uid FROM users, intmemb WHERE users.uid = intmemb.uid AND intmemb.intid = $1', [request.params.iid]).on('row', function(row) {
				console.log(row);
				likes = likes + '<li><a href="/user/' + row.uid + '">' + row.uname + '</a> (Interest level: '+row.level+')</li>';
			
			}).on('end', function() {
			
			
				console.log('These folks do: ' + likes)
				response.write(likes);
				response.write('<p>see other interests: ');
				
				conn.query('SELECT * FROM interest ORDER BY RANDOM() LIMIT 6').on('row', function(row) {
				
				response.write('| <span title="' + row.desc + '"><a href="/interest/' + row.intid + '">' + row.name + '</a></span> ');
					
				}).on('end', function(){response.end(' |</p><br><a href="/interest/all">View all interests</a>');});
				
				});
			
			
			});
		});
		


		
app.get('/*', function(request, response) {
		response.writeHead(200, {'Content-Type': 'text/html'});
		response.write('<h1>Whoa there!</h1><p>Page not found. Check the URL maybe?</p>');
		response.end();
		});

		
//Visit localhost:8080
app.listen(8080, function() { console.log(' - listening on port 8080');});
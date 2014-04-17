//See README.md

var express = require('express');
var anyDB = require('any-db');
var conn = anyDB.createConnection('sqlite3://commondenominator.db');

var app = express();
app.use(express.bodyParser()); // definitely use this feature

var hbs = require('hbs');
app.set('view engine', 'html');
app.engine('html', hbs.__express);
app.set('views', __dirname + '/templates'); // tell Express where to find templates

var connect = require('connect');
// possibly change '/' to '/static'
app.use(connect.static(__dirname + '/', { maxAge: 86400000 }));

///////////////////////////
///////////////////////////

app.get('/favicon.ico', function(request, response) { console.log('favicon thrown out'); });

app.get('/',  function(request, response){
	response.render('project.html', {});
});

app.get('/login',  function(request, response){
	response.render('login.html', {});
});

app.get('/messages', function(request, response){
	response.render('messages.html', {});
});

app.get('/user/:uid', function(request, response){
	console.log(request.params.uid);
	conn.query('SELECT uname, loc, intr FROM users WHERE uid = $1', [request.params.uid]).on('row', 
		function(row) {
			console.log(row);
			
			response.writeHead(200, {'Content-Type': 'text/html'});
			response.write('<title>Details for ' + row.uname + '</title><h2>What is ' + row.uname + ' interested in?</h2><p>' 
			+ row.uname + ' likes interests numbers ' + row.intr + '.</p>'
			+ '<h2>Where is ' + row.uname + '?</h2><p>' + row.uname + ' is at ' + row.loc 
			+ '.</p>'); 
			response.end();
				}); //how to access the results?
});

//note: autoincrement seems to put the first record's value at 2? how odd
app.get('/interest/:iid', function(request, response){
	console.log(request.params.iid);
	conn.query('SELECT name, desc FROM interest WHERE intid = $1', [request.params.iid]).on('row', 
		function(row) {
			console.log(row);
			
			response.writeHead(200, {'Content-Type': 'text/html'});
			response.write('<title>' + row.name + '</title><h1>' + row.name + ": " + row.desc //+ '.</h1>');
			+ '.</h1><h2>Who likes it?</h2><ul>');
			var likes = '';
			conn.query('SELECT uname, users.uid FROM users, intmemb WHERE users.uid = intmemb.uid AND intmemb.intid = $1', [request.params.iid]).on('row', function(row) {
				console.log(row);
				likes = likes + '<li><a href="/user/' + row.uid + '">' + row.uname + '</a></li>';
			
			}).on('end', function() {console.log('likes are: ' + likes)
			response.write(likes);
			response.write('<p>see other interests: <a href="/interest/1">Chess</a> | <a href="/interest/2">Boating</a> | <a href="/interest/3">Tanning</a> | <a href="/interest/4">Board Games</a> | <a href="/interest/5">Cars</a></p>');
			response.end('</ul>');});
			
			
			});
		});
		
app.get('/*', function(request, response) {
		response.writeHead(200, {'Content-Type': 'text/html'});
		response.write('<h1>Whoa there!</h1><p>Page not found. Check the URL maybe?</p>');
		response.end();
		});

//Visit localhost:8080
app.listen(8080, function() { console.log(' - listening on port 8080');});
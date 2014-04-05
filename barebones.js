//See README.md

var express = require('express');
var anyDB = require('any-db');
//Make sure zipcodes.db exists before you do this!
var conn = anyDB.createConnection('sqlite3://commondenominator.db');

var app = express();

//Your server implementation goes here!

app.get('/favicon.ico', function(request, response) { console.log('favicon thrown out'); });

app.get('/user/:uid', function(request, response){
	console.log(request.params.uid);
	conn.query('SELECT uname, loc, intr FROM users WHERE uid = $1', [request.params.uid]).on('row', 
		function(row) {
			console.log(row);
			
			response.writeHead(200, {'Content-Type': 'text/html'});
			response.write('<h2>What is ' + row.uname + ' interested in?</h2><p>' 
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
			response.write('<h1>' + row.name + ": " + row.desc + '.</h1>');
			//</h1><h2>Who likes it?</h2>');
			//once the autoincrement issue is fixed, dom will put in a way to show the names of folks who like this
			
			response.end();
			});
		});

//Visit localhost:8080
app.listen(8080, function() { console.log(' - listening on port 8080');});
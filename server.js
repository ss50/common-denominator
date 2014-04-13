
function c(x) {
    console.log(x);
} 

function p(x) {
    window.alert(x);
}

////////////

var express = require('express');
var app = express();
app.use(express.bodyParser()); // definitely use this feature

// var anyDB = require('any-db');
// var conn = anyDB.createConnection('sqlite3://chatroom.db');

var hbs = require('hbs');
app.set('view engine', 'html');
app.engine('html', hbs.__express);
app.set('views', __dirname + '/templates'); // tell Express where to find templates

var connect = require('connect');
// possibly change '/' to '/static'
app.use(connect.static(__dirname + '/', { maxAge: 86400000 }));

////////////

// this shit used to work: oh I know 
//app.use(express.favicon("images/favicon.ico"));

////////////

// 									room TEXT,								\
// 									name TEXT,								\
// 									body TEXT,								\
// 									time INTEGER 							\
// 								)");
// messagesDB.on('end', function() {
// 	console.log('Made messages table!');
// });
// // I couldn't find a cleaner way to check for table existance:
// messagesDB.on('error', function() {});

////////////

app.get('/',  function(request, response){
	response.render('project.html', {});
});

app.get('/login',  function(request, response){
	response.render('login.html', {});
});

app.get('/messages', function(request, response){
	response.render('messages.html', {});
});

////////////
console.log("Server listening at port 8080");
app.listen(8080);






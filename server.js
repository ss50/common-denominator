
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
app.use(connect.static(__dirname + '/static', { maxAge: 86400000 }));

////////////

// this shit used to work:
//app.use(express.favicon("images/favicon.ico"));

////////////

// var messagesDB = conn.query(	"CREATE TABLE messages (					\
// 									id INTEGER PRIMARY KEY AUTOINCREMENT,	\
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

app.get('/messages', function(request, response){
	response.render('messages.html', {});
});

////////////

app.listen(8080);






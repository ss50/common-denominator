var anyDB = require('any-db');
//var conn = anyDB.createConnection('sqlite3://commondenominator.db');
var crypto = require('crypto');

var fs = require("fs");
var file = "commondenominator.db";
var exists = fs.existsSync(file);

if(!exists) {
	console.log("Creating DB file.");
	fs.openSync(file, "w");
}

var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(file);

/*
============================================================
====================FOR TESTING PURPOSES====================
============================================================
*/


/*
_usr-logs (used for login purposes)
CHAR username PRIMARY KEY
CHAR pw-enc ( hash[hash(pw) + username] )?
---
_users (information on users themselves)
CHAR u-id : generate in some manner, six digit randomized and noncontiguous?
CHAR username
CHAR some sort of location information: 'LAT,LONG'


uid		username		loc (lat,long)				
A8K1	Chad			41.8193,-71.3922			
G44H	Diane			41.8193,-71.3947			
Q2QV	Mark			41.8218,-71.3997			
MM7M	Sandra			41.8293,-71.4097			
CRLF	Dexter			41.8318,-71.3997			
83C5	Leo				41.8218,-71.4022			
BHQT	James			41.8193,-71.4072			
LC9H	Nestor			41.8218,-71.4097			
K5DD	Harris			41.8268,-71.3947			
6EVJ	Bertha			41.8293,-71.3972			
NML0	Francine		41.8268,-71.4047			
VI4S	Tim				41.8168,-71.4022			




12 users above*/
/*
	1	2	3	4	5	6	7	8
1			N			S
2		J			
3					F
4	T		L				
5			M				De
6						B
7		Di			H
8		C


*/
/*
db.run('CREATE TABLE IF NOT EXISTS usrlogs(username CHAR PRIMARY KEY, password CHAR);').on('end'
	,function(){
		console.log('-User logs table created');
		db.run('INSERT INTO usrlogs(username,password) VALUES("Chad","1K8A")');
		db.run('INSERT INTO usrlogs(username,password) VALUES("Diane","H44G")');
		db.run('INSERT INTO usrlogs(username,password) VALUES("Mark","VQ2Q")');
		db.run('INSERT INTO usrlogs(username,password) VALUES("Sandra","M7MM")');
		db.run('INSERT INTO usrlogs(username,password) VALUES("Dexter","FLRC")');
		db.run('INSERT INTO usrlogs(username,password) VALUES("Leo","5C38")').on('end',function(){
			console.log('--All registered users inserted into usrlogs');
		})
	});
*/

/*
Adding password to this table, instead of creating a separate table for users and passwords
*/

function getHash(pwd){
	return crypto.createHash('md5').update(pwd).digest('hex');
}

// db.run('CREATE TABLE IF NOT EXISTS users (uid TEXT PRIMARY KEY, uname TEXT, password TEXT, loc TEXT);').on('end', 
// 		function() {
			
// 			db.run('INSERT INTO users (uid, uname, password, loc) VALUES ("A8K1","Chad",$pwd,"41.8193,-71.3922")', [getHash("Chad")]);
// 			db.run('INSERT INTO users (uid, uname, password, loc) VALUES ("G44H","Diane",$pwd,"41.8193,-71.3947")', [getHash("Diane")]);
// 			db.run('INSERT INTO users (uid, uname, password, loc) VALUES ("Q2QV","Mark",$pwd,"41.8218,-71.3997")', [getHash("Mark")]);
// 			db.run('INSERT INTO users (uid, uname, password, loc) VALUES ("MM7M","Sandra",$pwd,"41.8293,-71.4097")', [getHash("Sandra")]);
// 			db.run('INSERT INTO users (uid, uname, password, loc) VALUES ("CRLF","Dexter",$pwd,"41.8318,-71.3997")', [getHash("Dexter")]);
// 			db.run('INSERT INTO users (uid, uname, password, loc) VALUES ("83C5","Leo",$pwd,"41.8218,-71.4022")', [getHash("Leo")]);
// 			db.run('INSERT INTO users (uid, uname, password, loc) VALUES ("BHQT","James",$pwd,"41.8193,-71.4072")', [getHash("James")]);
// 			db.run('INSERT INTO users (uid, uname, password, loc) VALUES ("LC9H","Nestor",$pwd,"41.8218,-71.4097")', [getHash("Nestor")]);
// 			db.run('INSERT INTO users (uid, uname, password, loc) VALUES ("K5DD","Harris",$pwd,"41.8268,-71.3947")', [getHash("Harris")]);
// 			db.run('INSERT INTO users (uid, uname, password, loc) VALUES ("6EVJ","Bertha",$pwd,"41.8293,-71.3972")', [getHash("Bertha")]);
// 			db.run('INSERT INTO users (uid, uname, password, loc) VALUES ("NML0","Francine",$pwd,"41.8268,-71.4047")', [getHash("Francine")]);
// 			db.run('INSERT INTO users (uid, uname, password, loc) VALUES ("VI4S","Tim",$pwd,"41.8168,-71.4022")', [getHash("Tim")]).on('end',

// 				function(){
// 					console.log('-All users inserted');
// 				});

// 			});

db.serialize(function() {
	if(!exists) {
		db.run("CREATE TABLE IF NOT EXISTS users (uid TEXT PRIMARY KEY, firstname TEXT, lastname TEXT, uname TEXT, password TEXT, email TEXT, phone TEXT, loc TEXT);");
		console.log('-users table created');

		db.run('INSERT INTO users (uid, firstname, lastname, uname, password, email, phone, loc) VALUES ("A8K1","Chad","Miller", "Chad", $pwd, "chad@brown.edu","555-555-5555","41.8193,-71.3922")', [getHash("Chad")]);
		db.run('INSERT INTO users (uid, firstname, lastname, uname, password, email, phone, loc) VALUES ("G44H","Diane", "Chang", "Diane", $pwd, "diane@brown.edu","555-555-5555","41.8193,-71.3947")', [getHash("Diane")]);
		db.run('INSERT INTO users (uid, firstname, lastname, uname, password, email, phone, loc) VALUES ("Q2QV","Mark", "McConnell", "Mark", $pwd,"mark@brown.edu","555-555-5555","41.8218,-71.3997")', [getHash("Mark")]);
		db.run('INSERT INTO users (uid, firstname, lastname, uname, password, email, phone, loc) VALUES ("MM7M","Sandra", "Day OConnor", "Sandra", $pwd,"sandra@brown.edu","555-555-5555","41.8293,-71.4097")', [getHash("Sandra")]);
		db.run('INSERT INTO users (uid, firstname, lastname, uname, password, email, phone, loc) VALUES ("CRLF","Dexter", "Barnes", "Dexter",$pwd,"dexter@brown.edu","555-555-5555","41.8318,-71.3997")', [getHash("Dexter")]);
		db.run('INSERT INTO users (uid, firstname, lastname, uname, password, email, phone, loc) VALUES ("83C5","Leo", "DiCaprio", "Leo", $pwd,"leo@brown.edu","555-555-5555","41.8218,-71.4022")', [getHash("Leo")]);
		db.run('INSERT INTO users (uid, firstname, lastname, uname, password, email, phone, loc) VALUES ("BHQT","James", "Brolin", "James", $pwd,"james@brown.edu","555-555-5555","41.8193,-71.4072")', [getHash("James")]);
		db.run('INSERT INTO users (uid, firstname, lastname, uname, password, email, phone, loc) VALUES ("LC9H","Nestor", "Smith", "Nestor", $pwd,"nestor@brown.edu","555-555-5555","41.8218,-71.4097")', [getHash("Nestor")]);
		db.run('INSERT INTO users (uid, firstname, lastname, uname, password, email, phone, loc) VALUES ("K5DD","Harris", "Fisher", "Harris", $pwd,"harris@brown.edu","555-555-5555","41.8268,-71.3947")', [getHash("Harris")]);
		db.run('INSERT INTO users (uid, firstname, lastname, uname, password, email, phone, loc) VALUES ("6EVJ","Bertha", "Seinfeld", "Bertha", $pwd,"bertha@brown.edu","555-555-5555","41.8293,-71.3972")', [getHash("Bertha")]);
		db.run('INSERT INTO users (uid, firstname, lastname, uname, password, email, phone, loc) VALUES ("NML0","Francine", "Frensky", "Francine", $pwd,"francine@brown.edu","555-555-5555","41.8268,-71.4047")', [getHash("Francine")]);
		db.run('INSERT INTO users (uid, firstname, lastname, uname, password, email, phone, loc) VALUES ("VI4S","Tim","Turner","Tim",$pwd,"tim@brown.edu","555-555-5555","41.8168,-71.4022")', [getHash("Tim")]);
	
		console.log('--All users inserted');
	}
});



/*
_interest: (information on interests themselves)
INT  int-id : numerical ID for the interest PRIMARY KEY
CHAR name 	: display name for this interest
?CHAR desc	: a description for this interest
CHAR url	: a url indicating a thumbnail image representing the image

intid	name			desc
1		Indie Music		I haven't heard of it either
2		Computers		Beep boop binary
3		Modern Art		Creativity goes wild
4		Surfing			Hang ten, fella
5		Traveling		Explore the globe
6		Concerts		Happily go deaf
7		Hiking			Lace up your boots
8		Chocolate		The best guilty pleasure
9		Chess			A game for geniuses
10		Boating			Just like T-Pain
11		Tanning			Soaking up rays
12		Board Games		Roll the dice and draw a card
13		Cars			Vroom vroom

*/



// db.run('CREATE TABLE IF NOT EXISTS interest (intid INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, desc TEXT);').on('end', 
// 		function() { 
// 			console.log('-Interests table created');
			
// 			db.run('INSERT INTO interest (name, desc) VALUES ("Indie Music","I haven\'t heard of it either")');
// 			db.run('INSERT INTO interest (name, desc) VALUES ("Computers","Beep boop binary")');
// 			db.run('INSERT INTO interest (name, desc) VALUES ("Modern Art","Creativity goes wild")');
// 			db.run('INSERT INTO interest (name, desc) VALUES ("Surfing","Hang ten fella")');
// 			db.run('INSERT INTO interest (name, desc) VALUES ("Traveling","Explore the globe")');
// 			db.run('INSERT INTO interest (name, desc) VALUES ("Concerts","Go deaf happily")');
// 			db.run('INSERT INTO interest (name, desc) VALUES ("Hiking","Lace up your boots")');
// 			db.run('INSERT INTO interest (name, desc) VALUES ("Chocolate","The best guilty pleasure")');
// 			db.run('INSERT INTO interest (name, desc) VALUES ("Chess","A game for geniuses")');
// 			db.run('INSERT INTO interest (name, desc) VALUES ("Boating","Just like T-Pain")');
// 			db.run('INSERT INTO interest (name, desc) VALUES ("Tanning","Soaking up rays")');
// 			db.run('INSERT INTO interest (name, desc) VALUES ("Board Games","Roll the dice, draw a card")');
// 			db.run('INSERT INTO interest (name, desc) VALUES ("Cars","Vroom vroom fast")').on('end', function() { 
// 				console.log('--All interests inserted');
// 				makeSpellFix();
// 			});
// 		});

db.serialize(function() {
	if(!exists) {
		db.run("CREATE TABLE IF NOT EXISTS interest (intid INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, desc TEXT, url TEXT);");
	
		console.log('-Interests table created');

		db.run('INSERT INTO interest (name, desc, url) VALUES ("Indie Music","I haven\'t heard of it either","http://8tracks.imgix.net/i/000/963/601/44043.original-228.gif?q=65&sharp=15&vib=10&fm=jpg&fit=crop&w=521&h=521")');
		db.run('INSERT INTO interest (name, desc, url) VALUES ("Computers","Beep boop binary","http://wwwdelivery.superstock.com/WI/223/1491/PreviewComp/SuperStock_1491R-1040175.jpg")');
		db.run('INSERT INTO interest (name, desc, url) VALUES ("Modern Art","Creativity goes wild","http://www.art-is-fun.com/image-files/abstract-painting-squares.jpg")');
		db.run('INSERT INTO interest (name, desc, url) VALUES ("Surfing","Hang ten fella","http://www.glamour.com/images/health-fitness/2013/06/ashley-greene-surfing-square-w352.jpg")');
		db.run('INSERT INTO interest (name, desc, url) VALUES ("Traveling","Explore the globe","http://www.airpano.com/files/Eiffel-Tower-Paris-France/image6a.jpg")');
		db.run('INSERT INTO interest (name, desc, url) VALUES ("Concerts","Go deaf happily","http://knightnews.com/wp-content/uploads/2013/01/spring.jpg")');
		db.run('INSERT INTO interest (name, desc, url) VALUES ("Hiking","Lace up your boots","https://lh6.googleusercontent.com/-oEc7XFuTVyY/UytHgg8014I/AAAAAAAAA3M/RTIQlj2kHE8/s640/blogger-image--1175115903.jpg")');
		db.run('INSERT INTO interest (name, desc, url) VALUES ("Chocolate","The best guilty pleasure","")');
		db.run('INSERT INTO interest (name, desc, url) VALUES ("Chess","A game for geniuses","")');
		db.run('INSERT INTO interest (name, desc, url) VALUES ("Boating","Just like T-Pain","")');
		db.run('INSERT INTO interest (name, desc, url) VALUES ("Tanning","Soaking up rays","")');
		db.run('INSERT INTO interest (name, desc, url) VALUES ("Board Games","Roll the dice, draw a card","")');
		db.run('INSERT INTO interest (name, desc, url) VALUES ("Cars","Vroom vroom fast","")');

		console.log('--All interests inserted');
		// makeSpellFix();
	}
});

/*
_int-memb: table of (interest-id, user-id) pairs
INT intid : numerical ID, foreign key with interest 
CHAR uid  : user marking this interest 
INT level : how much you're interested

intid	uid		level
1		A8K1	4
1		CRLF	2	
1		LC9H	3	
2		A8K1	4
2		G44H	1
2		Q2QV	5
2		MM7M	3
2		K5DD	2
3		G44H	4
3		Q2QV	5
3		83C5	1
3		BHQT	2
3		NML0	3
4		CRLF	5
4		83C5	5
4		BHQT	2
4		K5DD	4
4		6EVJ	1
5		A8K1	4
5		MM7M	5
5		83C5	2
5		LC9H	1
6		NML0	3
7		VI4S	5
8		6EVJ	1
8		VI4S	3



note: there's gotta be a better way of doing this.
*/

// db.run('CREATE TABLE IF NOT EXISTS intmemb (intid INTEGER, uid TEXT, level INTEGER);').on('end', 
// 		function() { 
// 			console.log('-Membership table created');
// 			db.run('INSERT INTO intmemb (intid, uid, level) VALUES (1,"A8K1",4)');
// 			db.run('INSERT INTO intmemb (intid, uid, level) VALUES (1,"CRLF",2)');
// 			db.run('INSERT INTO intmemb (intid, uid, level) VALUES (1,"LC9H",3)');
// 			db.run('INSERT INTO intmemb (intid, uid, level) VALUES (2,"A8K1",4)');
// 			db.run('INSERT INTO intmemb (intid, uid, level) VALUES (2,"G44H",1)');
// 			db.run('INSERT INTO intmemb (intid, uid, level) VALUES (2,"Q2QV",5)');
// 			db.run('INSERT INTO intmemb (intid, uid, level) VALUES (2,"MM7M",3)');
// 			db.run('INSERT INTO intmemb (intid, uid, level) VALUES (2,"K5DD",2)');
// 			db.run('INSERT INTO intmemb (intid, uid, level) VALUES (3,"G44H",4)');
// 			db.run('INSERT INTO intmemb (intid, uid, level) VALUES (3,"Q2QV",5)');
// 			db.run('INSERT INTO intmemb (intid, uid, level) VALUES (3,"83C5",1)');
// 			db.run('INSERT INTO intmemb (intid, uid, level) VALUES (3,"BHQT",2)');
// 			db.run('INSERT INTO intmemb (intid, uid, level) VALUES (3,"NML0",3)');
// 			db.run('INSERT INTO intmemb (intid, uid, level) VALUES (4,"CRLF",5)');
// 			db.run('INSERT INTO intmemb (intid, uid, level) VALUES (4,"83C5",5)');
// 			db.run('INSERT INTO intmemb (intid, uid, level) VALUES (4,"BHQT",2)');
// 			db.run('INSERT INTO intmemb (intid, uid, level) VALUES (4,"K5DD",4)');
// 			db.run('INSERT INTO intmemb (intid, uid, level) VALUES (4,"6EVJ",1)');
// 			db.run('INSERT INTO intmemb (intid, uid, level) VALUES (5,"A8K1",4)');
// 			db.run('INSERT INTO intmemb (intid, uid, level) VALUES (5,"MM7M",5)');
// 			db.run('INSERT INTO intmemb (intid, uid, level) VALUES (5,"83C5",2)');
// 			db.run('INSERT INTO intmemb (intid, uid, level) VALUES (5,"LC9H",1)');
// 			db.run('INSERT INTO intmemb (intid, uid, level) VALUES (6,"NML0",3)');
// 			db.run('INSERT INTO intmemb (intid, uid, level) VALUES (7,"VI4S",5)');
// 			db.run('INSERT INTO intmemb (intid, uid, level) VALUES (8,"6EVJ",1)');
// 			db.run('INSERT INTO intmemb (intid, uid, level) VALUES (8,"VI4S",3)').on('end', function() { console.log('--All membership entries inserted');});
// 			});

db.serialize(function() {
	if(!exists) {
		db.run('CREATE TABLE IF NOT EXISTS intmemb (intid INTEGER, uid TEXT, level INTEGER);');
	
		console.log('-Membership table created');

		db.run('INSERT INTO intmemb (intid, uid, level) VALUES (1,"A8K1",4)');
		db.run('INSERT INTO intmemb (intid, uid, level) VALUES (1,"CRLF",2)');
		db.run('INSERT INTO intmemb (intid, uid, level) VALUES (1,"LC9H",3)');
		db.run('INSERT INTO intmemb (intid, uid, level) VALUES (2,"A8K1",4)');
		db.run('INSERT INTO intmemb (intid, uid, level) VALUES (2,"G44H",1)');
		db.run('INSERT INTO intmemb (intid, uid, level) VALUES (2,"Q2QV",5)');
		db.run('INSERT INTO intmemb (intid, uid, level) VALUES (2,"MM7M",3)');
		db.run('INSERT INTO intmemb (intid, uid, level) VALUES (2,"K5DD",2)');
		db.run('INSERT INTO intmemb (intid, uid, level) VALUES (3,"G44H",4)');
		db.run('INSERT INTO intmemb (intid, uid, level) VALUES (3,"Q2QV",5)');
		db.run('INSERT INTO intmemb (intid, uid, level) VALUES (3,"83C5",1)');
		db.run('INSERT INTO intmemb (intid, uid, level) VALUES (3,"BHQT",2)');
		db.run('INSERT INTO intmemb (intid, uid, level) VALUES (3,"NML0",3)');
		db.run('INSERT INTO intmemb (intid, uid, level) VALUES (4,"CRLF",5)');
		db.run('INSERT INTO intmemb (intid, uid, level) VALUES (4,"83C5",5)');
		db.run('INSERT INTO intmemb (intid, uid, level) VALUES (4,"BHQT",2)');
		db.run('INSERT INTO intmemb (intid, uid, level) VALUES (4,"K5DD",4)');
		db.run('INSERT INTO intmemb (intid, uid, level) VALUES (4,"6EVJ",1)');
		db.run('INSERT INTO intmemb (intid, uid, level) VALUES (5,"A8K1",4)');
		db.run('INSERT INTO intmemb (intid, uid, level) VALUES (5,"MM7M",5)');
		db.run('INSERT INTO intmemb (intid, uid, level) VALUES (5,"83C5",2)');
		db.run('INSERT INTO intmemb (intid, uid, level) VALUES (5,"LC9H",1)');
		db.run('INSERT INTO intmemb (intid, uid, level) VALUES (6,"NML0",3)');
		db.run('INSERT INTO intmemb (intid, uid, level) VALUES (7,"VI4S",5)');
		db.run('INSERT INTO intmemb (intid, uid, level) VALUES (8,"6EVJ",1)');
		db.run('INSERT INTO intmemb (intid, uid, level) VALUES (8,"VI4S",3)');

		console.log('--All membership entries inserted');
	}
});


/*

level: descriptions of how interested a user is in an interest.


			
db.run('CREATE TABLE IF NOT EXISTS levels (level INTEGER PRIMARY KEY, description TEXT);').on('end',
		function() {
			console.log('-Levels descriptions created');
			db.run('INSERT INTO levels (level, description) VALUES (1, "I\'m a dabbler...")');
			db.run('INSERT INTO levels (level, description) VALUES (2, "I think it\'s neat.")');
			db.run('INSERT INTO levels (level, description) VALUES (3, "I sure do like it.")');
			db.run('INSERT INTO levels (level, description) VALUES (4, "I\'m super into it!")');
			db.run('INSERT INTO levels (level, description) VALUES (5, "I\'m all about this life!!!")');
			
		});*/

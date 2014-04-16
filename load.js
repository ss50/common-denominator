var anyDB = require('any-db');
var conn = anyDB.createConnection('sqlite3://commondenominator.db');
var crypto = require('crypto');
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
CHAR intr : parsable list of interests indicated by this user


uid		username		loc			intr
A8K1	Chad			2,8			1,2,5
G44H	Diane			2,7			2,3
Q2QV	Mark			3,5			2,3
MM7M	Sandra			6,1			2,5
CRLF	Dexter			7,5			1,4
83C5	Leo				3,4			3,4,5
*/
/*
	1	2	3	4	5	6	7	8
1						S
2	
3			
4			L				
5			M				De
6	
7		Di
8		C


*/
/*
conn.query('CREATE TABLE IF NOT EXISTS usrlogs(username CHAR PRIMARY KEY, password CHAR);').on('end'
	,function(){
		console.log('-User logs table created');
		conn.query('INSERT INTO usrlogs(username,password) VALUES("Chad","1K8A")');
		conn.query('INSERT INTO usrlogs(username,password) VALUES("Diane","H44G")');
		conn.query('INSERT INTO usrlogs(username,password) VALUES("Mark","VQ2Q")');
		conn.query('INSERT INTO usrlogs(username,password) VALUES("Sandra","M7MM")');
		conn.query('INSERT INTO usrlogs(username,password) VALUES("Dexter","FLRC")');
		conn.query('INSERT INTO usrlogs(username,password) VALUES("Leo","5C38")').on('end',function(){
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

conn.query('CREATE TABLE IF NOT EXISTS users (uid TEXT PRIMARY KEY, uname TEXT, password TEXT, loc TEXT, intr TEXT);').on('end', 
		function() {
			
			conn.query('INSERT INTO users (uid, uname, password, loc, intr) VALUES ("A8K1","Chad",$pwd,"2,8","1,2,5")', [getHash("Chad")]);
			conn.query('INSERT INTO users (uid, uname, password, loc, intr) VALUES ("G44H","Diane",$pwd,"2,7","2,3")', [getHash("Diane")]);
			conn.query('INSERT INTO users (uid, uname, password, loc, intr) VALUES ("Q2QV","Mark",$pwd,"3,5","2,3")', [getHash("Mark")]);
			conn.query('INSERT INTO users (uid, uname, password, loc, intr) VALUES ("MM7M","Sandra",$pwd,"6,1","2,5")', [getHash("Sandra")]);
			conn.query('INSERT INTO users (uid, uname, password, loc, intr) VALUES ("CRLF","Dexter",$pwd,"7,5","1,4")', [getHash("Dexter")]);
			conn.query('INSERT INTO users (uid, uname, password, loc, intr) VALUES ("83C5","Leo",$pwd,"3,4","3,4,5")', [getHash("Leo")]).on('end',

				function(){
					console.log('-All users inserted');
				});

			});



/*
_interest: (information on interests themselves)
INT  int-id : numerical ID for the interest PRIMARY KEY
CHAR name : display name for this interest
?CHAR desc: a description for this interest

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


conn.query('CREATE TABLE IF NOT EXISTS interest (intid INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, desc TEXT);').on('end', 
		function() { 
			console.log('-Interests table created');
			
			conn.query('INSERT INTO interest (name, desc) VALUES ("Indie Music","I haven\'t heard of it either")');
			conn.query('INSERT INTO interest (name, desc) VALUES ("Computers","Beep boop binary")');
			conn.query('INSERT INTO interest (name, desc) VALUES ("Modern Art","Creativity goes wild")');
			conn.query('INSERT INTO interest (name, desc) VALUES ("Surfing","Hang ten fella")');
			conn.query('INSERT INTO interest (name, desc) VALUES ("Traveling","Explore the globe")');
			conn.query('INSERT INTO interest (name, desc) VALUES ("Concerts","Go deaf happily")');
			conn.query('INSERT INTO interest (name, desc) VALUES ("Hiking","Lace up your boots")');
			conn.query('INSERT INTO interest (name, desc) VALUES ("Chocolate","The best guilty pleasure")');
			conn.query('INSERT INTO interest (name, desc) VALUES ("Chess","A game for geniuses")');
			conn.query('INSERT INTO interest (name, desc) VALUES ("Boating","Just like T-Pain")');
			conn.query('INSERT INTO interest (name, desc) VALUES ("Tanning","Soaking up rays")');
			conn.query('INSERT INTO interest (name, desc) VALUES ("Board Games","Roll the dice, draw a card")');
			conn.query('INSERT INTO interest (name, desc) VALUES ("Cars","Vroom vroom fast")').on('end', function() { console.log('--All interests inserted');});
			});






/*
_int-memb: table of (interest-id, user-id) pairs
INT intid : numerical ID, foreign key with interest 
CHAR uid : user marking this interest 

intid	uid
1		A8K1
1		CRLF
2		A8K1
2		G44H
2		Q2QV
2		MM7M
3		G44H
3		Q2QV
3		83C5
4		CRLF
4		83C5
5		A8K1
5		MM7M
5		83C5


*/

conn.query('CREATE TABLE IF NOT EXISTS intmemb (intid INTEGER, uid TEXT);').on('end', 
		function() { 
			console.log('-Membership table created');
			conn.query('INSERT INTO intmemb (intid, uid) VALUES (1,"A8K1")');
			conn.query('INSERT INTO intmemb (intid, uid) VALUES (1,"CRLF")');
			conn.query('INSERT INTO intmemb (intid, uid) VALUES (2,"A8K1")');
			conn.query('INSERT INTO intmemb (intid, uid) VALUES (2,"G44H")');
			conn.query('INSERT INTO intmemb (intid, uid) VALUES (2,"Q2QV")');
			conn.query('INSERT INTO intmemb (intid, uid) VALUES (2,"MM7M")');
			conn.query('INSERT INTO intmemb (intid, uid) VALUES (3,"G44H")');
			conn.query('INSERT INTO intmemb (intid, uid) VALUES (3,"Q2QV")');
			conn.query('INSERT INTO intmemb (intid, uid) VALUES (3,"83C5")');
			conn.query('INSERT INTO intmemb (intid, uid) VALUES (4,"CRLF")');
			conn.query('INSERT INTO intmemb (intid, uid) VALUES (4,"83C5")');
			conn.query('INSERT INTO intmemb (intid, uid) VALUES (5,"A8K1")');
			conn.query('INSERT INTO intmemb (intid, uid) VALUES (5,"MM7M")');
			conn.query('INSERT INTO intmemb (intid, uid) VALUES (5,"83C5")').on('end', function() { console.log('--All membership entries inserted');});
			});


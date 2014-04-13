var anyDB = require('any-db');
var conn = anyDB.createConnection('sqlite3://commondenominator.db');

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
conn.query('CREATE TABLE IF NOT EXISTS users (uid TEXT PRIMARY KEY, uname TEXT, loc TEXT, intr TEXT);').on('end', 
		function() {
			console.log('-Users table created');
			
			conn.query('INSERT INTO users (uid, pwd, uname, loc, intr) VALUES ("A8K1","Chad","2,8","1,2,5")');
			conn.query('INSERT INTO users (uid, pwd, uname, loc, intr) VALUES ("G44H","Diane","2,7","2,3")');
			conn.query('INSERT INTO users (uid, pwd, uname, loc, intr) VALUES ("Q2QV","Mark","3,5","2,3")');
			conn.query('INSERT INTO users (uid, pwd, uname, loc, intr) VALUES ("MM7M","Sandra","6,1","2,5")');
			conn.query('INSERT INTO users (uid, pwd, uname, loc, intr) VALUES ("CRLF","Dexter","7,5","1,4")');
			conn.query('INSERT INTO users (uid, pwd, uname, loc, intr) VALUES ("83C5","Leo","3,4","3,4,5")')

			});



/*
_interest: (information on interests themselves)
INT  int-id : numerical ID for the interest PRIMARY KEY
CHAR name : display name for this interest
?CHAR desc: a description for this interest

intid	name			desc
1		Chess			A game for geniuses
2		Boating			Just like T-Pain
3		Tanning			Soaking up rays
4		Board Games		Roll the dice and draw a card
5		Cars			Vroom vroom

*/


conn.query('CREATE TABLE IF NOT EXISTS interest (intid INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, desc TEXT);').on('end', 
		function() { 
			console.log('-Interests table created');
			
			conn.query('INSERT INTO interest (name, desc) VALUES ("Chess","A game for geniuses")');
			conn.query('INSERT INTO interest (name, desc) VALUES ("Boating","Just like T-Pain")');
			conn.query('INSERT INTO interest (name, desc) VALUES ("Tanning","Soaking up rays")');
			conn.query('INSERT INTO interest (name, desc) VALUES ("Board Games","Roll the dice, draw a card")');
			conn.query('INSERT INTO interest (name, desc) VALUES ("Cars","Vroom vroom fast")')
			conn.query('INSERT INTO interest (name, desc) VALUES ("Traveling","something about traveling")')
			conn.query('INSERT INTO interest (name, desc) VALUES ("Chocolate","something about chocolate")')
			conn.query('INSERT INTO interest (name, desc) VALUES ("Computers","something about computers")').on('end', function() { console.log('--All interests inserted');});
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


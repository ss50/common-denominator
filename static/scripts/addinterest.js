var anyDB = require('any-db');
var conn = anyDB.createConnection('sqlite3://commondenominator.db');

alert('loaded?');

var _fObj = document.getElementById('add');
		
_fObj.addEventListener('submit', function(e) {
			e.preventDefault();
			var name = this.intname.value;
			var desc = this.desc.value;
			alert(name);
			conn.query('INSERT INTO interest (name, desc) VALUES ($1, $2)', [name, desc]).on('end', function() {alert(name + ' added to interests table');});
			});
			
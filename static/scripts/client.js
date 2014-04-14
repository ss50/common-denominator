/*
 This file contains all the functions that handle
 client side operations (display of users per interest),
 display of the private profile page, etc.
*/


/*
This will generate a table to display all the users 
that like a certain interest. Eventually will take in 
json array as a parameter but for now it will take in 
the number of users, to see how it will be viewed on 
the html page
*/
function getUsers(numusers){
	var table = document.getElementById('users_table');
	var users_per_row = 5;
	var row;
	var cell;

	for (var i = 0; i < numusers; i++){
		col = document.createElement("td");
		text = document.createTextNode("User: " + i); // text as placeholder for now
		col.appendChild(text);
		if (i%users_per_row == 0){
			row = document.createElement("tr");
			table.appendChild(row);
		}
		row.appendChild(col);
	}
}


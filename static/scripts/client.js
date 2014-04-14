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
	$(table).css("width","100%");
	var width=$("#interest_main").width();
	console.log(width);
	var users_per_row = width/100;
	var row;
	var cell;

	for (var i = 0; i < numusers; i++){
		col = document.createElement("td");
		div = document.createElement("div"); // text as placeholder for now
		col.appendChild(div);

    	var img = document.createElement('img');

	var myimages=new Array();
	var ry;
	myimages[1]="http://widopublishing.com/wp-content/uploads/2013/01/Square-Profile-pic-2011edit.jpg";
	myimages[2]="http://ukseds.org/wp-content/uploads/2010/02/360-square-profile-left.png";
	myimages[3]="http://aukabusiness.com/wp-content/uploads/2013/09/Square-Profile-Pic.jpg";
	myimages[4]="http://www.rubix.co/wp-content/uploads/2013/10/WM-SQUARE-PROFILE-PHOTO-BLK-10_10_13.jpg";
	myimages[5]="http://ethenrichardson.com/wp-content/uploads/2013/08/Ethen-square-profile.jpg";
	myimages[6]="http://images.coplusk.net/users/130710/avatar/large_square_profile.jpg";
	myimages[7]="http://burrilldigitalhealth.com/wp-content/uploads/bw_square_profile_picture_1800x1800_medium_res.jpeg";
	myimages[8]="http://greatist.com/sites/default/files/styles/square_profile/public/Profile%20Pic%20Square.jpg?itok=3q_N78z9";
	myimages[9]="http://image3.redbull.com/rbcom/010/2012-07-08/1331574883509_1/0010/1/1500/1500/1/nasser-al-attiyah-profile-square.jpg";
	myimages[10]="https://pbs.twimg.com/profile_images/2190908500/SamBillen_square-profile-pic.gif";
	myimages[11]="https://pbs.twimg.com/profile_images/551405780/itamar_square_profile_new.jpg";


	ry=Math.floor(Math.random()*myimages.length);
	if (ry==0){
			ry=1;
	}

    	img.src = myimages[ry];
    	img.className="user_image";
   	 	
   	 	/*
   	 	var a = document.createElement('a');
		a.href='#';
		img.appendChild(a);
		*/
   	 	div.appendChild(img);

   		if (i%users_per_row == 0){
			row = document.createElement("tr");
			table.appendChild(row);
		}


		row.appendChild(col);


	}
}

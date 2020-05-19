const express = require('express');
const app = express.Router();
const md5 = require('md5');
const db = require('../app');



app.get('/', (req, res) => {
	let err = {message: ""}
	res.render('login', {page:'login',menuId:'login', err})
});

app.post('/', (req, res) => {
	const {username, password} = req.body;
	if(!username || !password){
		let err = { message: "Please fill in all the fields" };
		res.render('login',{page:'login',menuId:'login', err});
	}
	else{
		db.getConnection((err, conn) => {
			if(err){
				console.log(err);
			}
			else{
				
				let sql = 'SELECT * FROM users WHERE username="' + username + '"';
				conn.query(sql, (err, results) => {
					if(err){
						console.log(err);
					}
					else{
						if(results.length == 0){
							console.log('No such user in the database');
							let err = { message: "No such user in the database, please try again" };
							res.render('login',{page:'login',menuId:'login', err});
						}
						else if(username == results[0].username && results[0].password != md5(password)){
							console.log('Wrong password');
							let err = { message: "Wrong password, please try again" };
							res.render('login',{page:'login',menuId:'login', err});
						}
						else{
							console.log('successfully logged in');
							req.session.username = username;
							res.redirect('/landing-page/');
						}
						conn.release;
					}
				});
			}
	
		});
		
		//search for username in the database
	}
});

app.get('/landing-page/', (req, res) => {
	res.render('landing-page', {page:'landing-page',menuId:'landing-page'})
});


module.exports = app;

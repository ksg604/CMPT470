const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Business = require('../models/business');
const mongoose = require('mongoose');
//password validation
const passwordValidator = require('password-validator');
//password encryption
const bcrypt = require('bcryptjs');



function changeToUpperCase(name){
	var finalName = name.split(' ');
	for(let i =0; i < finalName.length ; i++){
		finalName[i] = finalName[i].charAt(0).toUpperCase() + finalName[i].slice(1).toLowerCase();
	}
	return finalName.join(' ');
}

var schema = new passwordValidator();
schema
.is().min(6)
.is().max(16)
.has().uppercase()
.has().digits()
.has().not().spaces();

//Middleware for routes, to make sure the user is authenticated
var authentication = function(req,res,next){
	if(req.session.userID){
		res.redirect('/user/dashboard');
	}else{
		next();
	}
};


router.get('/book',(req,res) => {
	//check if user is authenticated
	if(req.session.userID){
		User.findById(req.session.userID, function(err, user){
			if(err){
				console.log(err);
				res.redirect('/user');
			}
			//check if user is not in any queue of a restraunt
			if(user){
				if((user.currentRestraunt != null) && (typeof user.currentRestraunt != "undefined")){
					Business.findById(user.currentRestraunt, function(err, business){
						if(err){
							console.log(err);
							res.redirect('/user');
						}
						if(business){
							if(typeof req.query.id != "undefined"){
								let err = { message: "You are already in a queue list" };
								res.render('user-book',{page:'user-book',menuId:'user-dashboard', err, user, business});
							}else{
								console.log(user);
								console.log(business);
								res.render('user-book',{page:'user-book',menuId:'user-dashboard', user, business});
							}
						}
					});
				}
				//check if user is not any restraunt queue, if no then push it to the queue
				else if((user.currentRestraunt == null || typeof user.currentRestraunt == "undefined") && (typeof req.query.id != undefined && req.query.id != null )) {
					console.log(req.query.id);
					Business.findByIdAndUpdate(
						{_id: req.query.id},
						{ $push: {queueList: {id: user._id, name: user.name}}},
						{new: true},
						function(err, business){
							if(err){
								console.log(err);
								res.redirect('/user');
							}
							//update the current restraunt for the user if it's in queue
							else if(business){
								User.findByIdAndUpdate(
									{_id: req.session.userID},
									{currentRestraunt: business._id},
									{new: true},
									function(err, user){
										if(err){
											console.log(err);
											res.redirect('/user');
										}
										else if(user){
											let success = {message: "You have succefully been place in queue of " + business.name}
											res.render('user-book', {page:'user-book',menuId:'user-dashboard', user, business, success});
										}
									}
								);
							}
						}
					);
				}
				else{
					let err = { message: "Please book a business to view your bookings" };
					res.render('user-dashboard', {page:'user-dashboard',menuId:'user-dashboard', user, err});
				}
			}
		});
	}
	else{
		let err = { message: "Please login to add you to the queue list" };
		res.render('user-login',{page:'user-login',menuId:'home', err});
	}
});


router.get('/removeBook',(req,res)=>{
	if(req.session.userID){
		User.findByIdAndUpdate(
			{_id: req.session.userID},
			{currentRestraunt: null},
			{new: false},
			function(err,user){
				if(err){
					console.log(err);
					res.redirect('/user/dashboard');
				}
				else if(user){
					Business.findByIdAndUpdate(
						{_id: user.currentRestraunt},
						{$pull : {queueList: {id: user._id, name: user.name}}},
						{new : true},
						function(err, business){
							if(err){
								console.log(err);
								res.redirect('/user/dashboard');
							}
							else if(business){
								let success = {message: "You are succefully removed from the queue of " + business.name};
								user.currentRestraunt = null;
								res.render('user-dashboard', {page:'user-dashboard',menuId:'user-dashboard', user,success });
							}
						}
					);
				}
			}
		);

	}
	else{
		let err = { message: "Please login to remove you from the queue list" };
		res.render('user-login',{page:'user-login',menuId:'home', err});
	}
});

router.get('/dashboard',(req, res) => {
	if(req.session.userID){
		User.findById(req.session.userID, function(err, user){
			if(err){
				console.log(err);
			}
			else if(user){
				res.render('user-dashboard', {page:'user-dashboard',menuId:'user-dashboard', user});
			}
		});
	}
	else{
		let err = { message: "Please login to view your dashboard" };
		res.render('user-login',{page:'user-login',menuId:'home', err});
	}

});

router.get('/chat',(req, res) => {
	if(req.session.userID){
		User.findById(req.session.userID, function(err, user){
			if(err){
				console.log(err);
			}
			else if(user){
				if((user.currentRestraunt != null)&&(typeof user.currentRestraunt != "undefined")){
					res.render('user-chat', {page:'user-chat',menuId:'user-dashboard', user});
				}else{
					res.redirect('/user/dashboard');
				}
			}
		});
	}
	else{
		let err = { message: "Please login to chat" };
		res.render('user-login',{page:'user-login',menuId:'home', err});
	}
});



router.get('/logout',(req,res) => {
	req.session.destroy();
	res.redirect('/');
});


router.get('/', authentication, (req, res) => {
	res.render('user-home', {page:'user-home',menuId:'home'});
});

//User login
router.get('/login',authentication, (req, res) => {
	res.render('user-login', {page:'user-login',menuId:'home'});
});

router.post('/login', (req, res) => {
	const {email, password} = req.body;
	if(!email || !password){
		let err = { message: "Please fill in all the fields" };
		res.render('user-login',{page:'user-login',menuId:'home', err});
	}
	else{
		//search for the email in the db
		User.findOne({ email: email }).then(user => {
			if (user) {
				// compare password with bcrypt since password is hashed
				bcrypt.compare(password, user.password, (error, isMatch) => {
					if (error){
						console.log(error);
					}
					if (isMatch) {
						req.session.userID = user._id;
						res.redirect('/user/dashboard');
					} else {
						let err = { message: "Wrong Password" };
						res.render('user-login',{page:'user-login',menuId:'home', err});
					}
				});
				//if email doesn't exisit in the db
			} else {
				let err = { message: "Email doesn't exisit" };
				res.render('user-login',{page:'user-login',menuId:'home', err});
			}
		});

	}
});


router.get('/businessReview',(req, res) => {
	if(req.session.userID){
		if(typeof req.query.id != "undefined"){
			Business.findById(req.query.id, function(err, business){
				if(err){
					console.log(err);
					res.redirect('/user');
				}
				else if(business){
					User.findById(req.session.userID, (err, user) =>{
						if(err){
							console.log(err);
							res.redirect('/user');
						}
						else if(user){
							res.render('user-review', {page:'user-signup',menuId:'user-dashboard', query: req.query, data: JSON.stringify(business), user});
						}
					});
				}
			});
		}
	}
	else{
		let err = { message: "Please login to write a review" };
		res.render('user-login',{page:'user-login',menuId:'home', err});
	}
});

/*
router.get('/businessReview',(req, res) => {

	Business.find(function(err, result){
		if(err){
			console.log(err);
		}
		else{
			res.render('user-review', {page:'user-review', menuId: 'user-dashboard', query: req.query, data: JSON.stringify(result)})
		}

	});
});*/


router.post('/businessReview/',(req, res) => {
	const {rating, review, busId, userName} = req.body;
	const query = {_id : busId};
	const update = {
		"$push": {
		  "reviews": {
			"reviewer": userName,
			"review": review,
			"rating": rating
		  }
		}
	};



	//res.render('user-review-restaurant', {page:'user-review-restaurant', menuId: 'userMenu', query: req.query, data: JSON.stringify(result)});
	//res.redirect("/user/review-restaraunt?review=" + review + "&busId=" +busId +"&userName=" + username)
	Business.updateOne(query, update)
	.then(result =>{
		const {matchedCount, modifiedCount} = result;
		if(matchedCount && modifiedCount) {
			console.log(`Successfully added a new review.`)
		}
		User.findById(req.session.userID, function(err, user){
			if(err){
				console.log(err);
			}
			else if(user){
				res.render('user-dashboard', {page:'user-dashboard',menuId:'user-dashboard', user});
			}
		});
	});




});


//User Sign up
router.get('/signup', authentication, (req, res) => {
	res.render('user-signup', {page:'user-signup',menuId:'home'})
});


router.post('/signup', (req, res) => {
	let {name, email, password, rePassword} = req.body;
	 name = changeToUpperCase(name);
	//check if all fiels are not empty
	if (!name || !email || !password || !rePassword){
		let err = {message: 'Please fill in all the fields'};
		console.log('Empty field');
		res.render('user-signup',{page:'user-signup',menuId:'home', err, name, email});
	}
	//check if password is valid according to the schema set above
	else if(!schema.validate(password)){
		let err = {message: 'Password has to to be 6 - 16 and contain an UPPERCASE and a digit '};
		console.log('Invalid password validation');
		res.render('user-signup',{page:'user-signup',menuId:'home', err, name, email});
	}
	//check if password matches rePassword
	else if(password !== rePassword){
		let err = {message: "Passwords don't match"};
		console.log("Passwords don't match");
		res.render('user-signup',{page:'user-signup',menuId:'home', err, name, email});
	}
	else{
		//find if the email exisit
		User.findOne({email : email})
		.then(user =>{
			if(user){
				let err = {message: 'Email is already registered'};
				console.log("Email is already registered");
				res.render('user-signup',{page:'user-signup',menuId:'home', err, name, email});
			}
			//if email doesn't exisit then save it to the database
			else{
				let newUser = new User({name, email, password});
				bcrypt.genSalt(10, function(err, salt) {
					bcrypt.hash(password, salt, function(error, hash) {
						if(error){
							console.log(error);
						}
						newUser.password = hash;
						newUser
						.save()
						.then(function(user){
							console.log("Saved to DB: " + newUser );
							let success = {message: "You have successfuly registered"};
							res.render('user-login', {page:'user-signup',menuId:'home',success});
						})
						.catch(function(error){
							console.log(error);
						});
					});
				});
			}
		});
	}
});
module.exports = router;

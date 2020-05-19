const express = require('express');
const router = express.Router();
const Business = require('../models/business');
const User = require('../models/user');
const mongoose = require('mongoose');
const request = require('request');
//password validation
const passwordValidator = require('password-validator');
//password encryption
const bcrypt = require('bcryptjs');


function checkOpenDay(business){
	let currentDate = new Date();
	let currentDay = currentDate.getDay();
	if(currentDay == 0 && business.su == true){
		return true;
	}
	else if(currentDay == 1 && business.m == true){
		return true;
	}
	else if(currentDay == 2 && business.tu == true){
		return true;
	}
	else if(currentDay == 3 && business.w == true){
		return true;
	}
	else if(currentDay == 4 && business.th == true){
		return true;
	}
	else if(currentDay == 5 && business.fr == true){
		return true;
	}
	else if(currentDay == 6 && business.sa == true){
		return true;
	}
	else{
		return false;
	}
}

function checkOpenTime(business){
	let currentDate = new Date();
	let currentHour = currentDate.getHours();
	let currentMinute = currentDate.getMinutes() + (60 * currentHour);
	let businessOpenTime = business.openingHour.split(":");
	let businessCloseTime = business.closingHour.split(":");
	let openMinute = parseInt(businessOpenTime[1]) + (60 * ( parseInt(businessOpenTime[0])));
	let closeMinute = parseInt(businessCloseTime[1]) + (60 * ( parseInt(businessCloseTime[0])));
	// console.log("Current Minute: " + currentMinute + " open minute: " + openMinute + " closeMinute : " + closeMinute);
	if(openMinute == closeMinute){
		return true;
	}
	else if(openMinute < closeMinute){
		if(currentMinute >= openMinute && currentMinute < closeMinute){
			return true;
		}
		else{
			return false;
		}
	}
	else if(openMinute > closeMinute){
		//Maximum value of time = 23 * 60 + 59
		if(currentMinute>= openMinute && currentMinute <= 1439){
			return true;
		}
		else if(currentMinute >= 0 && currentMinute < closeMinute){
			return true;
		}
		else{
			return false;
		}
	}
}

function verifyAddress(body){
	//console.log(JSON.stringify(body,null,4));
	if(body.hasOwnProperty("results") && body.results.length == 1 &&
	body.results[0].hasOwnProperty("geometry") &&
	body.results[0].geometry.hasOwnProperty("location_type") &&
	body.results[0].geometry.location_type == "ROOFTOP")
	{
		return true;
	}
	else
	{
		return false;
	}
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
	if(req.session.businessID){
		res.redirect('/business/dashboard');
	}else{
		next();
	}
};

router.get('/serveUser', (req,res)=>{
	if(req.session.businessID && typeof req.query.id != "undefined"){
		Business.findByIdAndUpdate(
			{_id: req.session.businessID},
			{$pull : {queueList: {id: req.query.id, name: req.query.name}}},
			{new : true},
			function(err, business){
				if(err){
					console.log(err);
					res.redirect('/business/dashboard');
				}
				else if(business){
					User.findByIdAndUpdate(
						{_id: req.query.id},
						{currentRestraunt: null},
						{new: true},
						function(err,user){
							if(err){
								console.log(err);
								res.redirect('/business/dashboard');
							}
							else if(user){
								Business.findByIdAndUpdate(
									{_id: req.session.businessID},
									{$push : {serveList: {id: req.query.id, name: req.query.name}}},
									{new : true},
									function(err, bus){
										if(err){
											console.log(err);
											res.redirect('/business/dashboard');
										}
										else if(bus){
											let success= {message: "User: " + req.query.name+ " served"}
											let open = Boolean(Number(checkOpenTime(business) & checkOpenDay(business)));
											res.render('business-dashboard', {page:'business-dashboard',menuId:'business-dashboard',open: open, business, success});
										}
									}
								);
							}
						}
					);
				}
			}
		);
	}
	else if(req.session.businessID && typeof req.query.id == 'undefined'){
		res.redirect('/business/dashboard');
	}
	else{
		let err = {message: "Login to serve from business queue"};
		res.render('business-login',{page:'business-login',menuId:'home', err});
	}
});

router.get('/deleteUser', (req,res)=>{
	if(req.session.businessID && typeof req.query.id != "undefined"){
		Business.findByIdAndUpdate(
			{_id: req.session.businessID},
			{$pull : {queueList: {id: req.query.id, name: req.query.name}}},
			{new : true},
			function(err, business){
				if(err){
					console.log(err);
					console.log("Ballh");
					res.redirect('/business/dashboard');
				}
				else if(business){
					console.log("working");
					console.log(req.query);
					User.findByIdAndUpdate(
						{_id: req.query.id},
						{currentRestraunt: null},
						{new: true},
						function(err,user){
							if(err){
								console.log(err);
								res.redirect('/business/dashboard');
							}
							else if(user){
								let err= {message: "User: " + req.query.name+ " deleted."}
								let open = Boolean(Number(checkOpenTime(business) & checkOpenDay(business)));
								res.render('business-dashboard', {page:'business-dashboard',menuId:'business-dashboard',open: open, business, err});
							}
						}
					);
				}
			}
		);
	}
	else if(req.session.businessID && typeof req.query.id == 'undefined'){
		res.redirect('/business/dashboard');
	}
	else{
		let err = {message: "Login to delete from business queue"};
		res.render('business-login',{page:'business-login',menuId:'home', err});
	}
});


router.get('/logout',(req,res) => {
	req.session.destroy();
	res.redirect('/');
});

router.get('/dashboard',(req, res) => {
	if(req.session.businessID){
		Business.findById(req.session.businessID, function(err, business){
			if(err){
				console.log(err);
			}
			else if(business){
				let open = Boolean(Number(checkOpenTime(business) & checkOpenDay(business)));
				res.render('business-dashboard', {page:'business-dashboard',menuId:'business-dashboard',open: open, business});
			}
		});
	}
	else{
		let err = { message: "Please login to view your dashboard" };
		res.render('business-login',{page:'business-login',menuId:'home', err});
	}

});

router.get('/chat',(req, res) => {
	Business.findById(req.session.businessID, function(err, business){
		if(err){
			console.log(err);
		}
		else if(business){
			res.render('business-chat', {page:'business-chat',menuId:'business-dashboard', business});
		}
	});
});


router.get('/reviews',(req, res) => {
	if(req.session.businessID){
		Business.findById(req.session.businessID, function(err, business){
			if(err){
				console.log(err);
				res.redirect('/business');
			}
			else if(business){
				res.render('business-review', {page: 'business-review',menuId: 'business-dashboard', currBusiness: business, businessID: business._id});
			}
		})
	}
});

router.get('/', authentication, (req, res) => {
	res.render('business-home', {page:'business-home',menuId:'home'});
});

//Business login
router.get('/login',authentication, (req, res) => {
	res.render('business-login', {page:'business-login',menuId:'home'});
});

router.post('/login', (req, res) => {
	const {email, password} = req.body;
	if(!email || !password){
		let err = { message: "Please fill in all the fields" };
		res.render('business-login',{page:'business-login',menuId:'home', err});
	}
	else{
		//search for the email in the db
		Business.findOne({ email: email }).then(business => {
			if (business) {
				// compare password with bcrypt since password is hashed
				bcrypt.compare(password, business.password, (error, isMatch) => {
					if (error){
						console.log(error);
					}
					if (isMatch) {
						req.session.businessID = business._id;
						res.redirect('/business/dashboard');
					} else {
						let err = { message: "Wrong Password" };
						res.render('business-login',{page:'business-login',menuId:'home', err});
					}
				});
				//if email doesn't exisit in the db
			} else {
				let err = { message: "Email doesn't exisit" };
				res.render('business-login',{page:'business-login',menuId:'home', err});
			}
		});

	}
});



//Business Sign up
router.get('/signup', authentication, (req, res) => {
	res.render('business-signup', {page:'business-signup',menuId:'home'})
});


router.post('/signup', (req, res) => {
	const {name, email, password, rePassword, add1, add2, city, state, zip, country, radius, openingHourtemp ,closingHourtemp, monday, tuesday, wednesday, thursday, friday, saturday, sunday, queue} = req.body;
	//check if all fields are not empty
	const closingHour = closingHourtemp.toString();
	const openingHour = openingHourtemp.toString();
	const m = (monday == 'true');
	const tu = (tuesday == 'true');
	const w = (wednesday == 'true');
	const th = (thursday == 'true');
	const fr = (friday == 'true');
	const sa = (saturday == 'true');
	const su =(sunday == 'true');
	//create the address and get lattitude and longitude
	const address = add1+" "+add2+" "+city+" "+state+" "+country+" "+zip;
	const apikey = "AIzaSyCA3egeDlojmHi7fbwXRWBEvtdBGEuVtX0";
	const base_url = "https://maps.googleapis.com/maps/api/geocode/json?key=";
	const url = base_url+apikey+"&address="+address;
	//post request to google geocode to get lat and lng
	request(url, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			//parse JSON response from google and fetch coordinates
			body = JSON.parse(body);
			var coordinates = [];
			if(verifyAddress(body))
			{
				var lat = body.results[0].geometry.location.lat;
				var lng = body.results[0].geometry.location.lng;
				coordinates = [lat,lng];
			}
			if (!name || !email || !password || !rePassword || !openingHour || !closingHour || !queue || !add1 || !city || !state || !zip || !country || !radius){
				let err = {message: 'Please fill in all the fields'};
				console.log('Empty field');
				res.render('business-signup',{page:'business-signup',menuId:'home', err, name, email, password, rePassword,add1, add2, city, state, zip, country, radius, openingHour, closingHour, m, tu, w, th, fr, sa, su, queue});
			}
			//check if password is valid according to the schema set above
			else if(!schema.validate(password)){
				let err = {message: 'Password has to to be 6 - 16 and contain an UPPERCASE and a digit '};
				console.log('Invalid password validation');
				res.render('business-signup',{page:'business-signup',menuId:'home', err, name, email, add1, add2, city, state, zip, country, radius, openingHour, closingHour, m, tu, w, th, fr, sa, su, queue});
			}
			//check if password matches rePassword
			else if(password !== rePassword){
				let err = {message: "Passwords don't match"};
				console.log("Passwords don't match");
				res.render('business-signup',{page:'business-signup',menuId:'home', err, name, email, add1, add2, city, state, zip, country, radius, openingHour, closingHour, m, tu, w, th, fr, sa, su, queue});
			}
			//check if openingHour and closingHour are valid
			else if(openingHour === closingHour){
				let err = {message: "Opening hour can not be same as closing hour"};
				console.log("Passwords don't match");
				res.render('business-signup',{page:'business-signup',menuId:'home', err, name, email, password, rePassword, add1, add2, city, state, zip, country, radius, m, tu, w, th, fr, sa, su, queue});
			}
			//check if address supplied is a real address
			else if(coordinates.length !== 2){
				let err = {message: "The address could not recognized as a valid address."};
				console.log("Address not valid");
				res.render('business-signup',{page:'business-signup',menuId:'home', err, name, email, password, rePassword, openingHour, closingHour, m, tu, w, th, fr, sa, su, queue});
			}
			else{
				//find if the email exisit
				Business.findOne({email : email})
				.then(business =>{
					if(business){
						let err = {message: 'Email is already registered'};
						console.log("Email is already registered");
						res.render('business-signup',{page:'business-signup',menuId:'home', err, name, email, password, rePassword, add1, add2, city, state, zip, country, radius, openingHour, closingHour, m, tu, w, th, fr, sa, su, queue});
					}
					//if email doesn't exisit then save it to the database
					else{
						let newBusiness = new Business({name, email, password,add1, add2, city, state, zip, country, radius, openingHour, closingHour, m, tu, w, th, fr, sa, su, queue, coordinates});
						bcrypt.genSalt(10, function(err, salt) {
							bcrypt.hash(password, salt, function(error, hash) {
								if(error){
									console.log(error);
								}
								newBusiness.password = hash;
								newBusiness
								.save()
								.then(function(business){
									console.log("Saved to DB: " + newBusiness );
									let success = {message: "You have successfuly registered"};
									res.render('business-login', {page:'business-signup',menuId:'home',success});
								})
								.catch(function(error){
									console.log(error);
								});
							});
						});
					}
				});
			}
		}
		else { //problem getting geocode from google
			let err = {message: "The address could not recognized as a valid address."};
			console.log("Google connection problem");
			res.render('business-signup',{page:'business-signup',menuId:'home', err, name, email, password, rePassword, openingHour, closingHour, m, tu, w, th, fr, sa, su, queue});
		}
	});
});
module.exports = router;

const express = require('express');
const router = express.Router();
const Business = require('../models/business');
const User = require('../models/user');
const MessageHistory = require('../models/messages').MessageHistory;
const mongoose = require('mongoose');

router.get('/getAllBusinesses', (req,res) => {
	var query = Business.find({}).select('-email -password');
	query.exec(function (err,businesses) {
		res.send(businesses);
	});
});

router.get('/getAllUsers', (req,res) => {

	User.find(function(err, result){
		if(err){
			console.log(err);
		}
		else{
			//res.send(result);
			res.send(result);
		}
	});
})

router.post('/clearChat', (req, res) => {
	MessageHistory.update({roomName:req.body.roomName}, { $set: { messages: [] }}, function(err, affected){
    	console.log('affected: ', affected);
	});
});


module.exports = router;
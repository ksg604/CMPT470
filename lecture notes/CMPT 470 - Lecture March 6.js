




//working with mongodb and nodejs


var MongoClient = require('mongodb').MongoClient

var url = ...

MongoClient.connect(url, function(err, client) {
	
	console.log("Connected successfully to server");

	var database = client.db('users')
	var collection = database.collection('documents');

	collection.insertMany([{a:1, {a:2}, {a:3}], function(err, result) {

		console.log("entered 3 documents");
		client.close;


	});

	










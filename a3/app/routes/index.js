const express = require('express');
const mysql = require('mysql');
const router = express.Router();


const db = mysql.createConnection({
    host: '35.230.112.182',
    user: 'test_user',
    password: 'test_pass',
    database: 'asn3db'
});

db.connect((err) => {
    if(err)
    {
        console.log(err);
    }
    else
    {
        console.log('MySql Connected');
    }
})


//GET home page
router.get('/', (req, res) => {
	//res.send('hello')
	res.render('index', {page:'User Database',menuId:'menu'})
})

// Create DB
router.get('/createdb', (req, res) => {
    let sql = 'CREATE DATABASE asn3db';
    db.query(sql, (err, result) => {
        if(err) console.log(err);
        console.log(result);
        res.send('database created...');
    });
});

router.get('/createuserstable', (req, res) => {
    let sql = 'CREATE TABLE users(id int AUTO_INCREMENT, name VARCHAR(255), email VARCHAR(255), age int, phone VARCHAR(255), address VARCHAR(255), gender VARCHAR(20), dob VARCHAR(255), PRIMARY KEY(id))';
    db.query(sql, (err, result) => {
        if(err)
        {
            console.log(err);
        }
        else
        {
            console.log(result);
            res.send('Users table created...');
        }
    });
});

router.get('/addUser', (req, res) => {
    let user = {name: 'Laura', email: 'laura@gmail.com', age: 55, phone: '604-511-4354', address: 'test street 3000', gender: 'female', dob: '1975-03-15'};
    let sql = 'INSERT INTO users SET ?';
    let query = db.query(sql, user, (err, result) => {
        if(err) 
        {
            console.log(err);
        }
        else
        {
            console.log(result);
            res.send('User created')
        }
    })
})

router.get('/getusers', (req, res) => {
	let sql = 'SELECT * FROM users';
	let query = db.query(sql, (err, results) => {
		if(err)
		{
			console.log(err);
		}
		else
		{
			console.log(results);
			res.json(results);
		}
	})
})

router.get('/delete_users', function(req, res) {
	let sql = 'Truncate table users';
	let query = db.query(sql, (err, results) => {
		if(err)
		{
			console.log(err);
		}
		else
		{
			console.log(results);
			res.json(results);
		}
	})
})

router.post('/delete_user', function(req, res) {
	let user = {id: req.body.id,
		name: req.body.name,
		email: req.body.email,
		age: req.body.age,
		phone: req.body.phone,
		address: req.body.address,
		gender: req.body.gender,
		dob: req.body.dob
	}
	let sql = 'DELETE FROM users where id = '+user.id;
	let query = db.query(sql, user, (err, result) => {
		if(err)
		{
			console.log(err);
		}
		else
		{
			console.log(result);
			res.send("Success");
		}
	})
})

router.post('/edit_user', function(req, res) {
	let user = {id: req.body.id,
		name: req.body.name,
		email: req.body.email,
		age: req.body.age,
		phone: req.body.phone,
		address: req.body.address,
		gender: req.body.gender,
		dob: req.body.dob
	}
	let sql = 'update users set name = '+user.name +', email = '+ user.email + ', age = '+ user.age +', phone = ' + user.phone + ', address = ' + user.address + ', gender = ' + user.gender + ', dob = ' +user.dob + ' where id = ' +user.id;
	let query = db.query(sql, user, (err, result) => {
		if(err)
		{
			console.log(err);
		}
		else
		{
			console.log(result);
			res.send("Success");
		}
	})
})

router.post('/create_user', function(req, res) {
	
	let user = {id: req.body.id,
		name: req.body.name,
		email: req.body.email,
		age: req.body.age,
		phone: req.body.phone,
		address: req.body.address,
		gender: req.body.gender,
		dob: req.body.dob
	}
	
	let sql = 'INSERT INTO users SET ?';
	let query = db.query(sql, user, (err, result) => {
		if(err)
		{
			console.log(err);
		}
		else
		{
			console.log(result);
			res.send("Success");
		}
	})
})

module.exports = router
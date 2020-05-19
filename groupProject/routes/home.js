const express = require('express');
const router = express.Router();
router.get('/', (req, res) => {
	res.render('home', {page:'home',menuId:'home'})
});

router.get('/user', (req, res) => {
	res.render('user-home', {page:'user-home',menuId:'home'})
});
module.exports = router;

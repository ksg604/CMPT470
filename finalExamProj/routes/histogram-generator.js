const express = require('express');
const app = express.Router();

app.post('/', (req, res) => {
    const {letterGradesData} = req.body;

    req.session.letterGradesData = letterGradesData;
    res.redirect('printout-page/');
  
});


app.get('/printout-page', (req, res) => {
    res.render('printout-page', {page: 'printout-page', menuId: 'printout-page', data: req.session.data, letterGradesData: req.session.letterGradesData});
})
module.exports = app;
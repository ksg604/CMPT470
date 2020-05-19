const express = require('express');
const app = express.Router();
const csv = require('csvtojson');


//File upload handling reference: https://flaviocopes.com/how-to-handle-file-uploads-node/
app.post('/', (req, res) => {

    var csvFile = req.files.csvfile;

    csv()
    .fromString(csvFile.data.toString())
    .then((jsonObject)=>{
       
        
        for(var i = 0; i < jsonObject.length; i++){
            if(jsonObject[i].studentID == 'total'){
   
                var percentageWeight =  parseInt(jsonObject[i].quiz) + parseInt(jsonObject[i].midterm) + parseInt(jsonObject[i].final);
                console.log(percentageWeight);
                
                if(percentageWeight == 100){
                    console.log('Correct grade weight distribution');
                    req.session.data = jsonObject;
                    res.redirect('histogram-generator/');
                }
                else{
                    console.log('Incorrect total weight, please verify the grade weight distribution');
                    let err = { message: "Incorrect total weight, please verify the grade weight distribution"};
                    res.render('landing-page', {page: 'landing-page', menuId:'landing-page', err});
                }
            }
        }

    });
  
});


app.get('/histogram-generator/', (req, res) => {
    
    res.render('histogram-generator', {page:'histogram-generator',menuId:'histogram-generator', data: req.session.data});
})

module.exports = app;
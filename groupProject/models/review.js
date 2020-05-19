const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({

    reviewer : {
        type: String,
    },

    review : {
        type: String,
    },

    rating : {
        type: Number,
    }

});

module.exports = mongoose.model('Review', reviewSchema);

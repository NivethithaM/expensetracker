var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/ExpenseApp');

// To use this db in other files
module.exports = {mongoose};
var mongoose = require('mongoose'); //Importing database

var Expense = mongoose.model('Expense',{
  description: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date, 
    default: Date.now
  },
  amount: {
    type: Number,
    default: null
  },
  type: {
    type: String,
    default: null
  }
});

module.exports = {Expense};
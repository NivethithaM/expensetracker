const _ = require('lodash');
const express = require('express'); // Application Framework
const bodyParser = require('body-parser'); //Parse the request body before the route handlers.
const {ObjectID} = require('mongodb');
//Imported Db connection from db/mongoose.js
var {mongoose} = require('./db/mongoose');
var {Expense} = require('./models/expense');
var {User} = require('./models/user');

var app = express();
const port = 8000;

app.use(bodyParser.json()); //middleware.

//Route to Post an expense for a date
app.post('/addexpense', (req,res) => {
  var newrecord = new Expense({
    description: req.body.description,
    date: req.body.date,
    amount: req.body.amount,
    type: req.body.type,
  });
  newrecord.save().then((result) => {
    res.send(result);
  },(e) => {
    res.status(404).send('Unable to Insert the record');
  });
});

//Route to list all the expense
app.get('/getexpense', (req , res) => {
  Expense.find().then((result) => {
    res.send({result});
  }).catch((e) => {
    res.status(400).send(e);
  });
});

//Route to get the startdate and enddate from the req params and return the sum of the amount.
app.get('/getexpense/:startdate/:enddate', (req, res) => {
  var startdate = new Date(req.params.startdate);
  var enddate = new Date(req.params.enddate);
  Expense.find({"date": {$gte:startdate, $lt:enddate}}).then((result) => {
    if (!result) {
      return res.status(404).send('No record is there for the dates');
    }
    var sum = 0;
    result.forEach((data) => {
      sum += data.amount;
    });
    res.send({result,
      "Total Amount" : sum,
    });
  },(e) => {
    res.status(400).send(e);
  });
});

//Route to get all the expenses for a type
app.get('/getexpense/:usertype', (req , res) => {
  var usertype = req.params.usertype;
  Expense.find({type: usertype}).then((result) => {
    if (!result) {
      return res.status(404).send('No record is there for the user types');
    }
    res.send({result});
  },(e) => {
    res.status(400).send(e);
  })
});

//Route to update the amount or other fields for the id.
app.patch('/getexpense/:id', (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['description', 'type','amount','date']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }
  Expense.findByIdAndUpdate(id, {$set: body}, {new: true}).then((result) => {
    if (!result) {
      return res.status(404).send();
    }
    res.send({result});
  }).catch((e) => {
    res.status(400).send();
  });
});

//Route to delete the record
app.delete('/getexpense/:id', (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Expense.findByIdAndRemove(id).then((result) => {
    if (!result) {
      return res.status(404).send();
    }

    res.send({result});
  }).catch((e) => {
    res.status(400).send();
  });
});

// User login properties
app.post('/users',(req,res) => {
  var body = _.pick(req.body, ['email', 'password']);
  var useraccess = new User(body);

  useraccess.save().then(() => {
    return useraccess.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token).send(useraccess);
  }).catch((e) => {
    res.status(400).send(e);
  });
});
//Listening to the Port 8000.
app.listen(port, () => {
  console.log(`Started up at port ${port}`);
});

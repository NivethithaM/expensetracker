//test framework
const expect = require('expect');
const request = require('supertest'); 
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Expense} = require('./../models/expense');

beforeEach((done) => {
  Expense.remove({}).then(() => done());
});

describe('POST /addexpense', () => {
  it('should create a new expense', (done) => {
    var body = {
      description: 'Food',
      date: '01/01/2019',
      amount: '40',
      type: 'grocery'
    };

    request(app)
      .post('/addexpense')
      .send(body)
      .expect(200)
      .expect((res) => {
        expect(res.body.description).toBe(body.description);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Expense.find().then((result) => {
          expect(result.length).toBe(1);
          expect(result[0].description).toBe(body.description);
          done();
        }).catch((e) => done(e));
      });
  });
  it('should not create expense with invalid body data', (done) => {
    request(app)
      .post('/addexpense')
      .send({})
      .expect(404)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Expense.find().then((result) => {
          expect(result.length).toBe(0);
          done();
        }).catch((e) => done(e));
      });
  });
});

const expense = [{
  _id: new ObjectID(),
  description: 'vegetable',
  amount : 15,
  type: 'Grocery',
  date: '2019-01-03'
}, {
  _id: new ObjectID(),
  description: 'Tv',
  amount : 43000,
  type: 'Electronics',
  date: '2019-01-08'
}];

// Test to get all the patiens
describe('GET /getexpense', () => {
  it('should get all the expenses', (done) => {
    Expense.insertMany(expense).then(() => done());
    request(app)
      .get('/getexpense')
      .expect(200)
      .expect((res) => {
        expect(res.body.result.length).toBe(2);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
      });
  });
});

describe('GET /getexpense/:usertype', () => {
  it('should return expense for the type', (done) => {
    Expense.insertMany(expense).then(() => done());
    request(app)
      .get(`/getexpense/${expense[0].type}`)
      .expect(200)
      .expect((res) => {            
        expect(res.body.result.length).toBe(1);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
      });
  });

 it('should return 404 if expense not found', (done) => {
    var usertype = 'Jewelery';

    request(app)
      .get(`/getexpense/${usertype}`)
      .expect(404)
      .end(done);
  });
});

// describe('GET /getexpense/:startdate/:enddate', () => {
//   it('should return expense for the date range', (done) => {
//     var enddate = '2019-01-03';
//     Expense.insertMany(expense).then(() => done());
//     request(app)
//       .get(`/getexpense/${expense[0].date}/${enddate}`)
//       .expect(200)
//       .expect((res) => {      
//         expect(res.body.result.length).toBe(1);
//       })
//       .end((err, res) => {
//         if (err) {
//           return done(err);
//         }
//       });
//   });
// });

//Update test
describe('PATCH /getexpense/:id', () => {
  it('should update the expense', (done) => {
    Expense.insertMany(expense).then(() => done());
    var hexId = expense[0]._id.toHexString();
    var description = 'Fruits';

    request(app)
      .patch(`/getexpense/${hexId}`)
      .send({
        description
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.result.description).toBe(description);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
      });
  });
});

// Delete expenses
describe('DELETE /getexpense/:id', () => {
  it('should remove a expense', (done) => {
    Expense.insertMany(expense).then(() => done());
    var hexId = expense[1]._id.toHexString();

    request(app)
      .delete(`/getexpense/${hexId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.result._id).toBe(hexId);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Expense.findById(hexId).then((result) => {
          expect(result).toNotExist();
          done();
        }).catch((e) => done(e));
      });
  });
});

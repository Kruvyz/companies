const PORT = process.env.PORT || 3000;
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());

app.use(express.static('public'));

const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const localUrl = 'mongodb://localhost:27017/companies-deploy';
const mongoUrl = process.env.MONGODB_URI || localUrl;

let mongo;
MongoClient
  .connect(mongoUrl)
  .then(function(client) {
    mongo = client.db();
  });

app.get('/companies', function(req, res) {
  let tree;
  mongo
  .collection('companies')
  .find()
  .toArray()
  .then(function(companies) {
    tree = makeTree(companies);
    count(tree);
    res.send(tree);
  });
});

app.post('/companies', function(req, res) {
  const company = req.body;

  mongo
  .collection('companies')
  .insert({
    name: company.name,
    earn: parseInt(company.earn),
    parent: company.parent
  });

  res.sendStatus(201);
});

app.delete('/companies/delete/:id', function(req, res) {

  mongo
  .collection('companies')
  .remove({ _id: new mongodb.ObjectID(req.params.id) });

  res.sendStatus(200);
});

app.post('/companies/edit/:id', function(req, res) {
  const company = req.body;

  mongo
    .collection('companies').update(
      { _id: new mongodb.ObjectID(req.params.id) },
      {
        $set: {
          name: req.body.name,
          earn: req.body.earn,
        }
      });
  res.sendStatus(200);
});

app.get('/companies/:id', function(req, res) {

  mongo
      .collection('companies')
      .find({ _id: new mongodb.ObjectID(req.params.id) })
      .toArray()
      .then(function(company) {
        res.send(company[0]);
      });
});


app.listen(3000, function() {
  console.log('Started on http://localhost:3000');
});

function makeTree(input) {
  let root = [];
  let byId = {};
  let i;

  for (i = 0; i < input.length; i++) {
    if (input[i].parent == '')
      root.push(input[i]);

    byId[input[i]._id] = input[i];
    input[i].children = [];
  }

  for (i = 0; i < input.length; i++) {
    if (byId[input[i].parent])
      byId[input[i].parent].children.push(input[i]);
  }

  return root;
}

function count(tree) {
  let total = 0;
  for (let node of tree) {
    if (Array.isArray(node.children)) {
      node.total = parseInt(node.earn) + count(node.children);
      total += parseInt(node.total);
    } else {
      total += parseInt(node.earn);
    }
  }
  return total;
}

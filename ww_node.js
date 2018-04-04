require('./port');
var express = require('express');
var app = express();

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// https://scotch.io/tutorials/use-expressjs-to-get-url-and-post-parameters
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// Connection URL
// See https://docs.mongodb.com/manual/reference/connection-string/
const url = 'mongodb://choinic1:02552@mcsdb.utm.utoronto.ca:27017/choinic1_309';

// Database Name
const dbName = 'choinic1_309';


// https://expressjs.com/en/starter/static-files.html
app.use(express.static('static-content'));


/* WHERE WE HAVE BEGUN WORKING */

// Post: Checking If User Exists.
app.post('/api/checkuser/:name/', function(req, res, next) {
	// Passed in User Parameters.
	var username = req.body.name;
	// Console Log Description (Server/Terminal).
	console.log("Post: Checking if User Exists: "+username);

	// Connect to MongoDB.
	MongoClient.connect(url, function(err, client) {
	  assert.equal(null, err);
	  const db = client.db(dbName);

	  // Checking User Existance.
	  db.collection('users').find({name: {$exists: true, $in:[username]}}).count(function(e, count) {
	  	// To return check value.
	  	var result = {};
	  	result['checkreg'] = [];
	  	result['checkreg'].push(count);
	  	res.json(result);
	  });

	  client.close();
	});
});

// Post: Logging In.
app.post('/api/login/:name/', function(req, res, next) {
	// Passed in User Parameters.
	var username = req.body.name;
	var password = req.body.pass;
	// Console Log Description (Server/Terminal).
	console.log("Post: Logging In: "+username);

	// Connect to MongoDB.
	MongoClient.connect(url, function(err, client) {
	  assert.equal(null, err);
	  const db = client.db(dbName);

	  // Checking User Existance.
	  db.collection('users').find({name: {$exists: true, $in:[username]}, pass: {$exists: true, $in:[password]}}).count(function(e, count) {
	  	// To return check value.
	  	var result = {};
	  	result['checklogin'] = [];
	  	result['checklogin'].push(count);
	  	res.json(result);
	  });

	  client.close();
	});
});

// Post: Register User.
app.post('/api/register/:name/', function(req, res, next) {
	// Passed in User Parameters.
	var item = {
		name: req.body.name,
		pass: req.body.pass,
		email: ''
	};
	// Console Log Description (Server/Terminal).
	console.log("Post: Register: "+req.body.name);

	// Connect to MongoDB.
	MongoClient.connect(url, function(err, client) {
	  assert.equal(null, err);
	  const db = client.db(dbName);

	  // Insert User.
	  db.collection('users').insertOne(item, function(err, result) {
	  	assert.equal(null, err);
	  	var result = {};
	  	result[req.body.name] = "updated rows";
	  	console.log(JSON.stringify(result));
		res.json(result);
	  });

	  client.close();
	});
});

app.listen(port, function () {
  	console.log('Example app listening on port '+port);
});


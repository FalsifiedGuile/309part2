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

// Use connect method to connect to the server
/*
MongoClient.connect(url, function(err, client) {
  assert.equal(null, err);
  console.log("Connected successfully to server");
  const db = client.db(dbName);
  // client.close();
}); */

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
	  console.log("Connected Successfully To Mongo Server");
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


	/*
	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		var result = db.collection('users').find({name: {exists: true, $in:[''+username]}});
		if (result != null) {
			console.log("POST:CheckExists:NotNull!");
		}
	}); */ 

});

app.listen(port, function () {
  	console.log('Example app listening on port '+port);
});


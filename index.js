const express = require('express')
const path = require('path')
var bodyParser = require('body-parser'); // Required if we need to use HTTP post parameters
const PORT = process.env.PORT || 5000
var app = express();



//module parses the JSON, buffer, string and URL encoded data submitted using Post
app.use(bodyParser.json());
// See https://stackoverflow.com/questions/25471856/express-throws-error-as-body-parser-deprecated-undefined-extended
app.use(bodyParser.urlencoded({ extended: true })); // Required if we need to use HTTP post parameters



//mongo database set up
var mongoUri = process.env.MONGODB_URI || "mongodb://heroku_dqp7cqrp:*LogIn*1@ds121321.mlab.com:21321/heroku_dqp7cqrp";
var MongoClient = require('mongodb').MongoClient, format = require('util').format;
var db = MongoClient.connect(mongoUri, function(error, databaseConnection) {
	db = databaseConnection;
});



app.post('/submit', function(request, response){
	response.header("Access-Control-Allow-Origin", "*");
	
	// username, score, grid
	var username = request.body.username;
	var score = parseInt(request.body.score);
	var grid = request.body.grid;
	var time = new Date(); //improve?


	
	
	if(username && score && grid){
		//processing of object to go through to mongo db
		var toInsert = {
			"username": username,
			"score": score,
			"grid": grid,
			"time": time
		}

		
		
		db.collection('game_data', function(error, coll) {
			coll.insert(toInsert, function(error, saved) {
				if (error) {
					response.send(500);
				}
				else {
					coll.find().sort({score: -1}).limit(10).toArray(function(error,results){
						response.send(results);

					});
				}
	    	});
		});


		
	}else{
		response.send('<html><head><title>Sorry!</title></head><body><h2>You must enter all fields!</h2></body></html>');
	}


});


app.get('/', function(request, response){
	response.set('Content-Type', 'text/html');
	var homePage = '';

	db.collection('game_data', function(er, collection) {
		//.limit(10) to only grab 10
		collection.find().sort({score: -1}).toArray(function(err, results) {

	
			if (!err) {
				homePage += "<!DOCTYPE HTML><html><head><title>2048 High Scores</title></head><body><h1>The High Scores Are:</h1>";
				for (var count = 0; count < results.length; count++) {
					homePage += "<p>The player " + results[count].username +" got " + results[count].score + " points!  " + results[count].time + "</p>";
				}
				homePage += "</body></html>"
				response.send(homePage);
			} else {
				response.send('<!DOCTYPE HTML><html><head><title>Sadness</title></head><body><h1>Everything is broken!</h1></body></html>');
			}
		});
	});


	
});


app.get('/scores.json', function(request, response){
	var UseName = request.query.username;
	

	response.set('Content-Type', 'text/html');
	var homePage = '';

	db.collection('game_data', function(er, collection) {
		collection.find({username: UseName}).sort({score: -1}).toArray(function(err, results) {

	
			if (!err) {
				response.send(results);
			} else {
				response.send('<!DOCTYPE HTML><html><head><title>Sadness</title></head><body><h1>Everything is broken!</h1></body></html>');
			}
		});
	});


});

app.listen(process.env.PORT || 5000);
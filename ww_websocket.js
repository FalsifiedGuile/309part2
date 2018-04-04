require('./port');

require("jquery").env("", function(err, window) {
    if (err) {
        console.error(err);
        return;
    }

    var $ = require("jquery")(window);
});
var webSocketPort = port+1;

var express = require('express');
var app = express();

// Game code
var gameStep=null;
var stage=null;
var interval=1000;
var level=[];


// static_files has all of statically returned content
// https://expressjs.com/en/starter/static-files.html

// Web Sockets
var WebSocketServer = require('ws').Server
   ,wss = new WebSocketServer({port: webSocketPort}),  LOBBY=[];

var messages=[];

wss.on('close', function() {
    console.log('disconnected');
});

wss.broadcast = function(message){
	for(let ws of this.clients){
		ws.send(stage);
	}

	// Alternatively
	// this.clients.forEach(function (ws){ ws.send(message); });
}

wss.on('connection', function(ws) {
  LOBBY.push(ws);
	var i;
  console.log("New User Connected");
  //console.log(LOBBY);

  //for(i=0;i<messages.length;i++){
		//ws.send(messages[i]);
	//}
	ws.on('message', function(message) {
		console.log(message);

		// ws.send(message);
    var point=JSON.parse(message);
    var t = point["x"];
    console.log(t);
    //console.log(point);
		wss.broadcast(stageJSON);
	//	messages.push(message);
	});
});
//game loop

$(function(){
  setupGame();
  startGame();
});

function setupGame(){
  stage=new Stage(20,20,"stage");
  stage.initialize();
  $.get("static-content/stage/s1.txt", function(data) {
   level = data.split('\n');
   stage.loadLevel(level);
 });
}
function startGame(){
  broadcastStage();
  gameStep = setInterval(function(){ mobsMove() }, interval);
}
function mobsMove(){
  console.log("tick once");
  if (stage.step() == "win"){
    pauseGame();
    winner();
    return;
  }
  if (stage.step() == "gameover"){
    gameover();
    return;
  }
  broadcastStage();
}
function winner(){
  var img = document.createElement("img");
  img.src = "http://i.imgur.com/rkxeQPC.gif";
  if(img && img.style) {
      img.style.height = '800px';
      img.style.width = '1000px';
  }
  $('#stage').html(img);
}
function gameover(){
  pauseGame();
  var img = document.createElement("img");
  img.src = "http://moziru.com/images/deadth-clipart-transparent-14.png";
  if(img && img.style) {
      img.style.height = '800px';
      img.style.width = '1000px';
  }
  $('#stage').html(img);
}

function broadcastStage(){
  wss.broadcast(encodeStage());
};

// Stage
// Note: Yet another way to declare a class, using .prototype.

function Stage(width, height, stageElementID){
	this.actors=[]; // all actors on this stage (monsters, player, boxes, ...)
	this.player=null; // a special actor, the player
	this.blanks=[];
	this.monsters=[];
	// the logical width and height of the stage
	this.width=width;
	this.height=height;

	// the element containing the visual representation of the stage
	this.stageElementID=stageElementID;

}

// initialize an instance of the game
Stage.prototype.initialize=function(){
	// Create a table of blank images, give each image an ID so we can reference it later


	for (var i = 0; i < 400; ++i) {
		this.blanks[i] = new blank("blank", "blank", i%20, (i - (i%20))/20);
		this.actors.push(this.blanks[i]);
	}


	// Add the player to the center of the stage

	// Add walls around the outside of the stage, so actors can't leave the stage
	//top of stage
	// Add some Boxes to the stage

}
Stage.prototype.loadLevel=function(level){
	for (var i = 0; i < 20; i++){
		var inputline = level[i].split('');
		for (var j = 0; j < 20; j++){
			if (inputline[j] == 'x'){
				newWall = new wall("wall", "wall", j, i);
				this.setActor(newWall);
			}
			if (inputline[j] == 'b'){
				newBox = new box("box", "box", j, i);
				this.setActor(newBox);
			}
			if (inputline[j] == 'd'){
				newDevil = new devil("devil", "monster", j, i);
				this.monsters.push(newDevil);
				this.setActor(newDevil);
			}
			if (inputline[j] == 'p'){
				this.player = new player("player", "player", j, i, 1);
				this.setActor(this.player);
			}
			if (inputline[j] == 's'){
				newSlime = new slime("slime", "monster", j, i);
				this.monsters.push(newSlime);
				this.setActor(newSlime);
			}
		}
	}

}

function encodeStage (){
  var stageJSON = {"stage":[]};
  for (var i = 0; i < 20; i++)
  {
    var newRow = row.clone();
    tableBody.append(newRow);
    for (var j = 0; j < 20; j++){
      var yLocation = y*20;
    	var xLocation = x;

    	var convertedLocation = yLocation + xLocation;
      switch (this.actors[convertedLocation].getName()) {
        case "player":
          stage["stage"].append("p");
          break;
        case "devil":
          stage["stage"].append("d");
          break;
        case "wall":
          stage["stage"].append("w");
          break;
        case "box":
          stage["stage"].append("b");
          break;
        case "slime":
          stage["stage"].append("s");
          break;
        default:
          stage["stage"].append("0");
          break;
      }

    }
    console.log("done");
  }
  return stageJSON;
}

Stage.prototype.addActor=function(actor){
	this.actors.push(actor);
}


Stage.prototype.removeActor=function(actor){
	// Lookup javascript array manipulation (indexOf and splice).
}

Stage.prototype.setActor=function(actor){
	x = actor.getXCord();
	y = actor.getYCord();
	var yLocation = y*20;
	var xLocation = x;
	var convertedLocation = yLocation + xLocation;
	this.actors[convertedLocation] = actor;
}

// Set the src of the image at stage location (x,y) to src
Stage.prototype.setImage=function(x, y, src){

}

// Take one step in the animation of the game.
Stage.prototype.step=function(){
	if (this.monsters.length > 0){
		for(var i=0;i<this.monsters.length;i++){
			if (this.monsters[i].move(this) == "gameover"){
				return "gameover";
			}
		}
	} else{
		return "win";
	}
}

// return the first actor at coordinates (x,y) return null if there is no such actor
// there should be only one actor at (x,y)!
Stage.prototype.getActor=function(x, y){
	var yLocation = y*20;
	var xLocation = x;
	var convertedLocation = yLocation + xLocation;
	return this.actors[convertedLocation];
}
// End Class Stage

// Start of actor Class
function actor(name, type, xCord, yCord) {
		this.name = name;
		this.type = type;
    this.xCord = xCord;
		this.yCord = yCord;
}

actor.prototype.getXCord=function() {
    return this.xCord;
}

actor.prototype.getYCord=function() {
    return this.yCord;
}
actor.prototype.getName=function() {
    return this.name;
}
actor.prototype.getType=function() {
    return this.type;
}
// End of actor CLASS

// Start of mob Class
function mob(name, type, xCord, yCord, status) {
	actor.call(this, name, type, xCord, yCord);
	// 0 is dead 1 is alive
	this.status = status;
}

mob.prototype = Object.create(actor.prototype);

mob.prototype.checkStatus=function(stage){
	var alive = 1
	var wallsAround = 0;
	var ya=this.yCord - 1;
	var yb=this.yCord + 2;
	var xa=this.xCord - 1;
	var xb=this.xCord + 2;
	for(var y=ya;y<yb;y++){
		for(var x=xa;x<xb;x++){
			if(stage.getActor(x,y).getType() != "player" && stage.getActor(x,y).getType() != "blank"){
				wallsAround++;
			}
		}
	}
	console.log(wallsAround);
	if (wallsAround == 9){
		this.status = 0;
		var index = stage.monsters.indexOf(this);
		if (index > -1) {
	    stage.monsters.splice(index, 1);
		}
		var yLocation = this.yCord*20;
		var xLocation = this.xCord;
		var convertedLocation = yLocation + xLocation;
		stage.setActor(stage.blanks[convertedLocation]);
	}
	return this.status;
}

mob.prototype.getValidMove=function(stage){
	var validMoves = [];
	var ya=this.yCord - 1;
	var yb=this.yCord + 2;
	var xa=this.xCord - 1;
	var xb=this.xCord + 2;

	for(var y=ya;y<yb;y++){
		for(var x=xa;x<xb;x++){
			if(stage.getActor(x,y).getType() == "blank" || stage.getActor(x,y).getType() == "player"){
				validMoves.push([x, y]);
			}
		}
	}
	return validMoves;
}
// End of mob Class

// Start of devil Class
function devil(name, type, xCord, yCord, status) {
	mob.call(this, name, type, xCord, yCord, status);
}

devil.prototype = Object.create(mob.prototype);

devil.prototype.move=function(stage) {
	if (this.checkStatus(stage) == 0){
		return;
	}

	var validMoves = this.getValidMove(stage);
	if (!Array.isArray(validMoves) || !validMoves.length) {
  	return;
	}
	var moveNumber = Math.floor((Math.random() * (validMoves.length)));
	var yLocation = this.yCord*20;
	var xLocation = this.xCord;
	var convertedLocation = yLocation + xLocation;
	stage.setActor(stage.blanks[convertedLocation]);
	if (stage.getActor(validMoves[moveNumber][0], validMoves[moveNumber][1]).getType() == "player"){
		stage.player.status = 0;
		return "gameover";
	}
	this.xCord = validMoves[moveNumber][0];
	this.yCord = validMoves[moveNumber][1];
	stage.setActor(this);
}
// End of devil Class

// Start of slime Class
function slime(name, type, xCord, yCord, status) {
	mob.call(this, name, type, xCord, yCord, status);
}

slime.prototype = Object.create(mob.prototype);

slime.prototype.move=function(stage) {
	if (this.checkStatus(stage) == 0){
		return;
	}

	var validMoves = this.getValidMove(stage);
	if (!Array.isArray(validMoves) || !validMoves.length) {
		return;
	}
	var whichValidMove = [0,0];
	var smallestDif = 9999;
	for (var i = 0; i<validMoves.length; i++){
		var differenceX = Math.abs(validMoves[i][0] - stage.player.getXCord());
		var differenceY = Math.abs(validMoves[i][1] - stage.player.getYCord());
		var  difference = Math.abs(differenceX + differenceY);

		if (difference < smallestDif){
			smallestDif = difference;
			whichValidMove[0] =  validMoves[i][0];
			whichValidMove[1] =  validMoves[i][1];
		}
	}
	var yLocation = this.yCord*20;
	var xLocation = this.xCord;
	var convertedLocation = yLocation + xLocation;
	stage.setActor(stage.blanks[convertedLocation]);
	if (stage.getActor(whichValidMove[0], whichValidMove[1]).getType() == "player"){
		stage.player.status = 0;
		return "gameover";
	}
	this.xCord = whichValidMove[0];
	this.yCord = whichValidMove[1];
	stage.setActor(this);
}
// End of slime Class
// Start of wall Class
function wall(name, type, xCord, yCord) {
	actor.call(this, name, type, xCord, yCord);
}

wall.prototype = Object.create(actor.prototype);
// End of wall Class
// Start of box Class
function box(name, type, xCord, yCord) {
	actor.call(this, name, type, xCord, yCord);
}

box.prototype = Object.create(actor.prototype);

box.prototype.attemptToMoveBox=function(stage, direction){
	var move = 0;
	var newCordTuple = [];
	var newXcord = 0;
	var newYcord = 0;
	newCordTuple = stage.getNewDirectionCord(this, direction);
	newXcord = newCordTuple[0];
	newYcord = newCordTuple[1];
	switch (stage.getActor(newXcord, newYcord).getType()){
		case "box":
			if (stage.getActor(newXcord, newYcord).attemptToMoveBox(stage, direction) == 1){
				move = 1;
				var yLocation = this.yCord*20;
				var xLocation = this.xCord;
				var convertedLocation = yLocation + xLocation;
				stage.setActor(stage.blanks[convertedLocation]);
			}
			break;
		case "blank":
			move = 1;
			break;
		default:
			move = 0;
		}
	if (move == 1){
		this.xCord = newXcord;
		this.yCord = newYcord;
	}
	stage.setActor(this);
	return move;

}
// End of box Class
// Start of player Class
function player(name, type, xCord, yCord, status) {
	actor.call(this, name, type, xCord, yCord);
	this.status = status;
}

player.prototype = Object.create(actor.prototype);

player.prototype.move=function(stage, direction){
	if(this.status == 0){
		return "gameover";
	}
	var yLocation = this.yCord*20;
	var xLocation = this.xCord;
	var convertedLocation = yLocation + xLocation;
	stage.setActor(stage.blanks[convertedLocation]);
	var newCordTuple = [];
	newCordTuple = stage.getNewDirectionCord(this, direction);
	var newXcord = newCordTuple[0];
	var newYcord = newCordTuple[1];
	var move = 0;
	ranInto = stage.getActor(newXcord, newYcord).getType();
	switch (ranInto){
		case "wall":
			move = 0;
			break;
		case "box":
			if (stage.getActor(newXcord, newYcord).attemptToMoveBox(stage, direction) == 1){
				move = 1;
			} else {
				move = 0;
			}
			break;
		case "monster":
			this.status = 0;
			return "gameover";
			break;
		case "blank":
			move = 1;
			break;
	}
	if (move == 1){
		this.xCord = newXcord;
		this.yCord = newYcord;
	}
	stage.setActor(stage.player);
	return "gameContinued";
}

// End of Player Class
// Start of blank Class
function blank(name, type, xCord, yCord) {
	actor.call(this, name, type, xCord, yCord);
}

blank.prototype = Object.create(actor.prototype);
// End of Player Class

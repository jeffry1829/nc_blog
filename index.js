var Netcat = require('node-netcat');
var Server = Netcat.server(5000);
var clients = Server.getClients();
var verifyed = [];
var express = require('express');
var app = express();
var fs = require('fs');
var context = {};
var markdown = require('markdown').markdown;

app.get('/', function(req, res, next){
	var responseHTML="";
	fs.readFile('context.blog', function(err, data){
		if(err) throw err;
		context = JSON.parse(data);
	});
	for(var key in context){
		responseHTML += context[key]['title'];
		responseHTML += '<br/>';
		responseHTML += context[key]['post'];
		responseHTML += '<br/>';
		responseHTML += context[key]['number'];
	}
	res.send(responseHTML);
	next();
});

Server.on('ready', function(){
	console.log('server ready');
});
Server.on('data', function(client, data){
	console.log('data in: ',data);
	data = data.toString();
	console.log('data in: ',data);
	if(data.match(/^verify .*/g)){
		if(data.split(' ')[1]=='mypw'){
			verifyed.push(client);
		}
	}
	if(verifyed.indexOf(client)){
		console.log('verifyed: ',data);
	}
});
Server.on('client_on', function(client){
	clients.push(client);
	console.log(client);
});

Server.listen();

console.log('please input title')

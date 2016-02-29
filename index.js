var Netcat = require('node-netcat');
var Server = Netcat.server(5000);
var clients = Server.getClients();
var verifyed = [];
var express = require('express');
var app = express();
var fs = require('fs');
var context = {};
var markdown = require('markdown').markdown;
var statuscode="title";

var currentTitle="";

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
		responseHTML += '<br/>';
	}
	res.send(responseHTML);
	next();
});

Server.on('ready', function(){
	console.log('server ready');
});
Server.on('data', function(client, data){
	data = data.toString().replace(/\n/g, '');
	if(data.match(/^verify .*/g)){
		if(data.split(' ')[1]=='mypw'){
			verifyed.push(client);
			Server.send(client, 'please input title');
			return;
		}else{
			Server.send(client, 'again!');
		}
	}
	if(verifyed.indexOf(client)!==-1){
		switch(statuscode){
			case 'title':
				currentTitle = data;
				context[currentTitle] = {};
				context[currentTitle]['title'] = data;
				statuscode = 'post';
				Server.send(client,'please input post');
				break;
			case 'post':
				context[currentTitle]['post'] = data;
				statuscode = "title";
				Server.send(client,'please input nexttitle');
				fs.writeFile('context.blog', JSON.stringify(context), function(err){
					if(err) throw err;
				});
				break;
		}
	}
});
Server.on('client_on', function(client){
	clients.push(client);
	Server.send(client,'please verify');
});
Server.on('client_of', function(client){
	delete clients[clients.indexOf(client)];
	if(verifyed.indexOf(client)!==-1){
		delete verifyed[verifyed.indexOf(client)];
	}
})
app.listen(3000);
Server.listen();

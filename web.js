var express = require('express');

var app = express();

app.use(express.logger());

var fs = require('fs');

var buffer = new Buffer(32);
buffer = fs.readFileSync("index.html");

//var message = buffer.toString();

app.get('/', function(request, response) {
//  response.send('Hello World again and again!');  
//  response.send(message);
  response.send(buffer.toString());
});

var port = process.env.PORT || 5000;

app.listen(port, function() {
  console.log("Listening on " + port);
});

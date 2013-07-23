var express = require('express');

var app = express();

app.use(express.logger());

var fs = requires('fs');

var buffer = new Buffer(32);
buffer = fs.readFile("index.html");

var message = buffer.toString();

app.get('/', function(request, response) {
//  response.send('Hello World again and again!');  
  response.send(message);
});

var port = process.env.PORT || 5000;

app.listen(port, function() {
  console.log("Listening on " + port);
});

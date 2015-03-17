var express = require('express'),
  config = require('./config/config'),
  glob = require('glob'),
  mongoose = require('mongoose');

mongoose.connect(config.db);
var db = mongoose.connection;
db.on('error', function () {
  throw new Error('unable to connect to database at ' + config.db);
});

console.log("db connection working");

var models = glob.sync(config.root + '/app/models/*.js');
models.forEach(function (model) {
  require(model);
});
var app = express();

require('./config/express')(app, config);

app.set('port', process.env.OPENSHIFT_NODEJS_PORT);
app.set('ipaddr', process.env.OPENSHIFT_NODEJS_IP);
app.listen(config.port);

console.log("app listening at " + config.port);
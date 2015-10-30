var cluster = require('cluster');
if (cluster.isMaster) {
    var cpuCount = require('os').cpus().length;   
    for (var i = 0; i < cpuCount; i += 1) {
    	cluster.fork();
    }
    cluster.on('exit', function (worker) {
      console.log('Worker ' + worker.id + ' died :(');
      	cluster.fork();
      });
} else {
    // Include Express
    var express = require('express');
    var compression = require('compression')
    var bodyParser = require('body-parser');
    // Create a new Express application
    var app = express();
    var path = require('path');
    var util=require('util');

    app.use(express.static(path.join(__dirname, 'public')));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(compression({filter: shouldCompress}))
    app.set('port', process.env.PORT || 3000);
    function shouldCompress(req, res) {
    	if (req.headers['x-no-compression']) {
    		return false
    	}
		  return compression.filter(req, res)
		}		
		app.listen(app.get('port'));
		console.log('Worker ' + cluster.worker.id + ' running!');
	}
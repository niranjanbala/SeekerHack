'use strict';
var solrApi = require('./modules/solrApi');
var tilesRenderer = require('./modules/tilesRenderer');
var path = require('path');
var appSettings=require('./config/settings.json');
module.exports = {
	renderPng: function (req, res) {
		var config=appSettings['production'];
		var filterParams = solrApi.createFilterParams(req, false);
		if(!filterParams){
			module.exports.sendTile(res);
		} else {
			var tileType='serp';
			var tileConfig=config[tileType];
		  solrApi.getGeoJsonData(tileConfig.solrRoute, filterParams, function(err) {
	      if (err) {
	      	module.exports.sendTile(res);
	      } else {
	      	tilesRenderer.renderTile(tileType, filterParams, function(error, tile){
	      		if(error){
	      		}
	      		module.exports.sendTile(res, tile);
	      	});
	      }
    	});
		}
	},
	renderVt: function (req, res) {
	  tilesRenderer.renderVtTile(req.params.x,req.params.y,req.params.z,function(error, tile){
	  	if(error){
	  		console.log(error);
	  		module.exports.sendTile(res);	
	  	} else{
	  		module.exports.sendTile(res, tile);	
	  	}
	    
	  });
	},
	renderUtf: function (req, res) {
		var config=appSettings['production'];
		var filterParams = solrApi.createFilterParams(req, false);
		if(!filterParams ){
			console.log('here');
			module.exports.sendUtf(req, res);
		} else {
			var tileType='serp';
			var tileConfig=config[tileType];
		  solrApi.getGeoJsonData(tileConfig.solrRoute, filterParams, function(err) {
	      if (err) {
	      	module.exports.sendUtf(req, res);
	      } else {
	      	tilesRenderer.renderGrid(tileType, filterParams, function(error, grid){
	      		if(error){
	      		}	     
	      		module.exports.sendUtf(req, res, grid);
	      	});
	      }
    	});
		}
	},
	sendTile: function(res, tile){
		if(tile) {
			res.writeHead(200, {'Content-Type': 'image/png'});
      res.end(tile);
		}else {
			res.sendfile(path.join(__dirname, 'Blank.png')); //TODO: Not working
		}
	},
	sendUtf: function(req, res, grid,headers){		
		res.set('content-type', 'text/javascript');
    var resString = req.query.callback + '(' + JSON.stringify(grid) + ')';
    res.end(resString);
	}
}

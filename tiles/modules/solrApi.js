var https = require('https');
var fileUtils = require('./fileUtils');

function getNormalizedCoord(coord, zoom) {
    var y = coord.y;
    var x = coord.x;
    // tile range in one direction range is dependent on zoom level
    // 0 = 1 tile, 1 = 2 tiles, 2 = 4 tiles, 3 = 8 tiles, etc
    var tileRange = 1 << zoom;
    // don't repeat across y-axis (vertically)
    if (y < 0 || y >= tileRange) {
        return null;
    }
    // repeat across x-axis
    if (x < 0 || x >= tileRange) {
        x = (x % tileRange + tileRange) % tileRange;
    }
    return {
        x: x,
        y: y
    };
}

var solrApi={
	createFilterParams: function(req, isGrid) {
          try {
              //Extract the parameters
              var filterParams = JSON.parse(req.query.qs);
              //Set X,Y,Z parameters

              var coord = {
                  x: req.params.x,
                  y: req.params.y
              };

              var normalizedCoord = getNormalizedCoord(coord, req.params.z);

              if (!normalizedCoord) {
                  return null;
              }
              filterParams.x = normalizedCoord.x;
              filterParams.y = normalizedCoord.y;
              filterParams.z = req.params.z;
              filterParams.geo_json = 1;
              filterParams.fetch_max = null;
              filterParams.gridOrImage = isGrid ? 'grid' : 'image'; // Request Type
              filterParams.tile_ts = new Date().getTime();
              filterParams.page_size = 500; //Set page size
              if(isNaN(filterParams.x) || isNaN(filterParams.y) || isNaN(filterParams.z)) {
                  return null;
              } else {
                  return filterParams;
              }
          } catch(e) {
              // log error
              return null;
          }
    },
	getGeoJsonData: function (options, filterParams, stepObject) {
		var dataString = JSON.stringify(filterParams);
		var headers = {
			'Content-Type': 'application/json',
			'Content-Length': dataString.length
		};
		var requestOptions = {
			host: options.host,
			path: options.path,
			method: options.method,
			headers: headers
		};
		var req = https.request(requestOptions, function(res) {
			res.setEncoding('utf-8');
			var responseString = '';
			res.on('data', function(data) {
				responseString += data;
			});
			res.on('end', function() {
				fileUtils.writeGeoJsonFile(filterParams,responseString,stepObject);
			});
		});
		req.on('error', stepObject);
		req.end(dataString);
	}	
}
module.exports=solrApi;

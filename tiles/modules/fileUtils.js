var fs = require('fs');
var geojsonhint=require('geojsonhint');
var _=require('lodash');
var fileUtils= {
	fixupGeoJson: function(geoJsonString) {
		var errors = geojsonhint.hint(geoJsonString);
		if(errors.length>0) {
			try {
				var geoJsonObject=JSON.parse(geoJsonString);
				var fixedFeatures=_.filter(geoJsonObject.features, function(obj){ 
					return obj.geometry.coordinates.length==2 && obj.geometry.coordinates[0]!=null && obj.geometry.coordinates[1]!=null 
				});
				geoJsonObject.features=fixedFeatures;
				return JSON.stringify(geoJsonObject);
			}catch(err){
				return '{"type": "FeatureCollection","features": []}';
			}
		} else {
			return geoJsonString;
		}
	},
	writeGeoJsonFile:function(filterParams, geoJsonString, callback) {
		fs.writeFile(this.getGeoJsonFileName(filterParams), this.fixupGeoJson(geoJsonString), callback); 
	},
	getGeoJsonFileName: function(filterParams) {
    return "/tmp/"+filterParams.tile_ts + "-" + filterParams.request_id + "-" + filterParams.x + "-" + filterParams.y + "-" + filterParams.z + "-" + filterParams.gridOrImage + ".geojson";
  },
  unlinkGeoJsonFile: function(filterParams) {
    fs.unlink(this.getGeoJsonFileName(filterParams), function() {});
  }
}
module.exports = fileUtils;

var fileUtils = require('./fileUtils');
var _ = require('lodash');
var mapnik = require('mapnik');
if (mapnik.register_default_input_plugins) mapnik.register_default_input_plugins();
var mercator = require('./sphericalmercator');
var fs = require('fs');
var XML={
    "listingStyles.xml": '<?xml version="1.0" encoding="utf-8"?><Map  minimum-version="3.0.0" srs="+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs +over"><Parameters><Parameter name="interactivity_layer">listing</Parameter><Parameter name="interactivity_fields">utfData</Parameter></Parameters><Style name="point" filter-mode="first"><Rule><MinScaleDenominator>100000</MinScaleDenominator><MarkersSymbolizer fill="#666666" opacity="1" width="7" stroke="white" stroke-width="1.2" stroke-opacity="1" placement="point" marker-type="ellipse" allow-overlap="true"/></Rule><Rule><MaxScaleDenominator>100000</MaxScaleDenominator><MinScaleDenominator>50000</MinScaleDenominator><MarkersSymbolizer fill="#666666" opacity="1" width="7" stroke="white" stroke-width="1.2" stroke-opacity="1" placement="point" marker-type="ellipse" allow-overlap="true"/></Rule><Rule><MaxScaleDenominator>50000</MaxScaleDenominator><MinScaleDenominator>25000</MinScaleDenominator><MarkersSymbolizer fill="#666666" opacity="1" width="7" stroke="white" stroke-width="1.2" stroke-opacity="1" placement="point" marker-type="ellipse" allow-overlap="true"/></Rule><Rule><MaxScaleDenominator>25000</MaxScaleDenominator><MinScaleDenominator>0</MinScaleDenominator><MarkersSymbolizer fill="#666666" opacity="1" width="7" stroke="white" stroke-width="1.2" stroke-opacity="1" placement="point" marker-type="ellipse" allow-overlap="true"/></Rule></Style><Layer name="listing" srs="+proj=longlat +datum=WGS84"><StyleName>point</StyleName><Datasource><Parameter name="type">geojson</Parameter><Parameter name="file"><%= filepath %></Parameter></Datasource></Layer></Map>'
};
var appSettings=require('../config/settings.json');
module.exports={
    getMapnikXml: function(tileConfig, filterParams){
        var geoJsonFilePath=fileUtils.getGeoJsonFileName(filterParams);
        var data = {
                    filepath: geoJsonFilePath
        };
        var template = _.template(XML[tileConfig.style.file]);
        var xml = template(data);
        return xml;
    },
    renderVtTile: function(x,y,z,callback){
        var path=require('path');
        var map = new mapnik.Map(256, 256);
        map.bufferSize = 128;
        var opts = {strict: false, base: '/'};
        var data = {
                    filepath: path.join(__dirname, 'vt.geojson')
        };
        var template = _.template(XML['listingStyles.xml']);
        var xml = template(data);
        map.fromString(xml, opts, function(err, map) {
            if (err) {
                callback(err);
                return;
            }
            var bbox = mercator.xyz_to_envelope(parseInt(x),parseInt(y),parseInt(z), false);
            map.extent = bbox;
            var im = new mapnik.Image(256, 256);                
            map.render(im,function(err, output){
                if(err){
                    callback(err);
                } else{                    
                    callback(null, output.encodeSync('png'));                        
                }
            });
        }); 
        
    },
    renderTile: function(tileType, filterParams, callback) {
        var tileConfig=appSettings['production'][tileType];
        var map = new mapnik.Map(tileConfig.tileSize, tileConfig.tileSize);
        map.bufferSize = 128;
        var opts = {strict: false, base: '/'};
        try {
            map.fromString(this.getMapnikXml(tileConfig, filterParams), opts, function(err, map) {
                if (err) return callback(err);
                var bbox = mercator.xyz_to_envelope(parseInt(filterParams.x),
                    parseInt(filterParams.y),
                    parseInt(filterParams.z), false);
                map.extent = bbox;                
                var im = new mapnik.Image(tileConfig.tileSize, tileConfig.tileSize);                
                map.render(im,function(err, output){
                    if(err){
                        callback(err);
                    } else{                    
                        callback(null, output.encodeSync('png'));                        
                    }
                });
            });                            
        } catch (err) {
            return callback(err);
        }
    },
    renderGrid : function(tileType, filterParams, callback) {
        var tileConfig=appSettings['production'][tileType];
        var map = new mapnik.Map(tileConfig.tileSize, tileConfig.tileSize);
        map.bufferSize = 128;
        var opts = {strict: false, base: '/'};
        try {
            map.fromString(this.getMapnikXml(tileConfig, filterParams), opts, function(err, map) {
                if (err) return callback(err);
                var bbox = mercator.xyz_to_envelope(parseInt(filterParams.x),
                    parseInt(filterParams.y),
                    parseInt(filterParams.z), false);
                map.extent = bbox;                
                var im = new mapnik.Grid(tileConfig.tileSize, tileConfig.tileSize);
                var options = {'layer': 0,'fields': ['utfData']};// Parameters      
                map.render(im,options, function(err, output){
                    if(err){                        
                        callback(err);
                    } else {
                        callback(null, output.encodeSync({type:'utf', resolution:4}));                        
                    }
                });
            });                            
        } catch (err) {
            return callback(err);
        }
    }
}
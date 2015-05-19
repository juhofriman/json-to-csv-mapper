'use strict';

var _ = require('underscore-node');

module.exports =  {
  jsonToCsv: function(json, mapSpec) {
    // This implementation is total load of bollocks and purely prototype
    var paths = [];
    _.each(mapSpec, function(field) {
      if(!_.isUndefined(field.f)){
        var path = [];
        _.each(field.f.split("."), function(token){
          path.push(token);
        });
        paths.push(path);
      }
    });

    var csvRepresentation = [];
    _.each(json, function(object) {

      var csvRow = [];

      _.each(paths, function(path) {
        var entry = object;
        _.each(path, function(token) {
          if(!_.isUndefined(entry)) {
            entry = entry[token];
          }
        });
        if(!_.isUndefined(entry)) {
          csvRow.push(entry);
        }
      });

      csvRepresentation.push(csvRow);

    });

    return csvRepresentation;
  }
};

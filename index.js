'use strict';

var _ = require('underscore-node');

function getCallbacksArray(mappingField) {
  if(_.isUndefined(mappingField.cb)) {
    return [];
  }
  if(_.isArray(mappingField.cb)) {
    return mappingField.cb;
  }
  if(_.isFunction(mappingField.cb)) {
    return [mappingField.cb];
  }
}

module.exports =  {
  CB_QUOTE: function(data) {
    return '"' + data + '"';
  },
  jsonToCsv: function(json, mapSpec) {
    // This implementation is total load of bollocks and purely prototype
    var paths = [];
    _.each(mapSpec, function(field) {
      if(!_.isUndefined(field.f)){
        var path = field.f.split(".");
        paths.push({path: path, cb: getCallbacksArray(field)});
      }
    });

    var csvRepresentation = [];
    _.each(json, function(object) {

      var csvRow = [];

      _.each(paths, function(path) {
        var entry = object;
        _.each(path.path, function(token) {
          if(!_.isUndefined(entry)) {
            entry = entry[token];
          }
        });
        if(!_.isUndefined(entry)) {
          _.each(path.cb, function(callback) {
            entry = callback(entry);
          });
          csvRow.push(entry);

        }
      });

      csvRepresentation.push(csvRow);

    });

    return csvRepresentation;
  }
};

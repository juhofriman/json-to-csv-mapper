'use strict';

var _ = require('underscore-node');

module.exports =  {
  jsonToCsv: function(json, mapSpec) {
    var csvRepresentation = [];
    _.each(json, function(object) {

      var csvRow = [];

      _.each(mapSpec, function(field) {

        var t = object;

        if(!_.isUndefined(field.f)){
          _.each(field.f.split("."), function(token){
            t = t[token];
          })
          if(!_.isUndefined(t)){
            csvRow.push(t);
          }
        }

      });

      csvRepresentation.push(csvRow);

    });

    return csvRepresentation;
  }
};

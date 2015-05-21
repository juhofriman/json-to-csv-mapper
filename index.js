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

function getMappingPaths(mapSpec) {
  var paths = [];
  _.each(mapSpec, function(field) {
    if(!_.isUndefined(field.f)){
      var path = field.f.split(".");
      paths.push(
        {path: path,
         cb: getCallbacksArray(field),
         mappings: field.m });
    }
  });
  return paths;
}

function runCallbacks(entry, callbacks) {
  _.each(callbacks, function(callback) {
      entry = callback(entry);
  });
  return entry;
}

function mapValue(entry, mappings) {
  return mappings[entry];
}

function modify(entry, path) {
  if(!_.isUndefined(path.mappings)) {
    entry = mapValue(entry, path.mappings);
  }
  return runCallbacks(entry, path.cb);
}

function createCsvRowFromObject(object, paths) {
  var csvRow = [];
  _.each(paths, function(path) {
    var entry = object;
    _.each(path.path, function(token) {
      if(!_.isUndefined(entry)) {
        entry = entry[token];
      }
    });
    if(!_.isUndefined(entry)) {
      csvRow.push(modify(entry, path));
    }
  });
  return csvRow;
}

module.exports =  {
  CB_QUOTE: function(data) {
    return '"' + data + '"';
  },
  jsonToCsv: function(objects, mapSpec) {

    var paths = getMappingPaths(mapSpec);

    var csvRows = [];
    _.each(objects, function(object) {
      csvRows.push(createCsvRowFromObject(object, paths));
    });

    return csvRows;
  }
};

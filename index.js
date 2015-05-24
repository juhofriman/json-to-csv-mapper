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
  for(var i = 0; i < mapSpec.length; i++) {
    var field = mapSpec[i];
    if(!_.isUndefined(field.f)){
      var path = field.f.split(".");
      paths.push(
        {path: path,
         cb: getCallbacksArray(field),
         mappings: field.m });
    }
  }
  return paths;
}

function runCallbacks(entry, callbacks) {
  // TODO: assert that callback is actually an function
  for(var i = 0; i < callbacks.length; i++) {
    entry = callbacks[i](entry);
  }
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

function _CB_QUOTE(data) {
  return '"' + data.replace(/"/g, '""') + '"';
}

module.exports =  {
  spec: function(config) {
    return {
      config: config || { addHeader: false },
      fields: [],
      currentField: null,
      field: function(path) {
        if(this.currentField != null) {
          this.fields.push(this.currentField);
        }
        this.currentField = { f: path, cb: []};
        return this;
      },
      valueMapping: function(mapping) {
        this.currentField.m = mapping;
        return this;
      },
      callback: function(cbFunc) {
        this.currentField.cb.push(cbFunc);
        return this;
      },
      escape: function() {
        this.callback(_CB_QUOTE);
        return this;
      },
      build: function() {
        if(this.currentField != null) {
          this.fields.push(this.currentField);
        }
        return this;
      }
    };
  },
  jsonToArray: function(objects, mapSpec) {

    var paths = getMappingPaths(mapSpec.fields);
    var csvRows = [];

    if(mapSpec.config.addHeader) {
      // Generate header row if requested
      var headerRow = [];
      for(var i = 0; i < paths.length; i++) {
        headerRow.push(paths[i].path.join("."));
      }
      csvRows.push(headerRow);
    }

    _.each(objects, function(object) {
      csvRows.push(createCsvRowFromObject(object, paths));
    });

    return csvRows;
  },
  materialize: function(objects, mapSpec) {
    var csv = "";
    _.each(this.jsonToArray(objects, mapSpec), function(row) {
      csv += row.join(",") + "\n";
    });
    return csv;
  }
};

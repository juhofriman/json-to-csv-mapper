'use strict';

var _ = require('underscore-node');

function getMappingPaths(mapSpec) {
  var paths = [];
  for(var i = 0; i < mapSpec.length; i++) {
    var field = mapSpec[i];
    if(!_.isUndefined(field.f)){
      var path = field.f.split(".");
      paths.push(
        {path: path,
         cb: field.cb,
         mappings: field.m });
    }
  }
  return paths;
}

function runCallbacks(entry, callbacks) {
  for(var i = 0; i < callbacks.length; i++) {
    entry = callbacks[i](entry);
  }
  return entry;
}

function mapValue(entry, mappings) {
  if(_.isFunction(mappings[entry])) {
    return mappings[entry](entry);
  }
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
  for(var i = 0; i < paths.length; i++) {
    var entry = object;
    var field = paths[i];
    for(var a = 0; a < field.path.length; a++) {
      var token = field.path[a];
      if(!_.isUndefined(entry[token])) {
        entry = entry[token];
      }
    }
    if(entry !== object) {
      csvRow.push(modify(entry, field));
    }
  }
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
      mapping: function(mapping) {
        // Dunno, if this is actuallyu a reasonable way of
        // checking whether mapping is associative
        // XXX: Could keys me functions as well? truthy -> change to value

        // This implementation breaks build on iojs.
        try {
          _.keys(mapping);
        } catch (err) {
          throw Error('Registering mapping for field: "' +
                      this.currentField.f + '" but that: "' +
                      mapping + '" is not associative!');
        }
        this.currentField.m = mapping;
        return this;
      },
      callback: function(cbFunc) {
        if(!_.isFunction(cbFunc)) {
          throw Error('Registering callback for field: "' +
                      this.currentField.f + '" but that: "' +
                      cbFunc + '" is not a function!');
        }
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

'use strict';

var fs = require('fs');
var jsonCsvMapper = require('./');

var cases = [
  {file: "./battle-test-data/contacts.json",
   mapping: [{f: "_.id"},
             {f: "guid"},
             {f: "isActive", m: {false: "disabled", true: "active"}},
             {f: "balance", cb: jsonCsvMapper.CB_QUOTE},
             {f: "picture"},
             {f: "age"},
             {f: "eyeColor"},
             {f: "gender", cb: function(data) { return data.toUpperCase(); }},
             {f: "email"},
             {f: "phone"},
             {f: "address", cb: jsonCsvMapper.CB_QUOTE},
             {f: "about", cb: [jsonCsvMapper.CB_REMOVE_TRAILING_NEWLINE,
                               jsonCsvMapper.CB_QUOTE]}]
  }
];









console.log(jsonCsvMapper.materialize(
  JSON.parse(fs.readFileSync(cases[0].file, 'utf8')),
  cases[0].mapping));

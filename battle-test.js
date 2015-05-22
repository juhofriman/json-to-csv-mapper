'use strict';

var fs = require('fs');
var jsonCsvMapper = require('./');

var cases = [
  { file: "./battle-test-data/contacts.json",
    mapping: jsonCsvMapper.spec()
               .field("_.id")
               .field("guid")
               .field("isActive").valueMapping({false: "disabled", true: "active"})
               .field("balance")
               .field("picture")
               .field("age")
               .field("eyeColor")
               .field("gender").valueCallbacks(function(data) { return data.toUpperCase(); })
               .field("email")
               .field("phone")
               .field("address").escape()
               .field("about").escape().valueCallbacks(jsonCsvMapper.CB_REMOVE_TRAILING_NEWLINE)
               .build()
  },
  { file: "./battle-test-data/nested-contacts.json",
   mapping: jsonCsvMapper.spec()
             .field("age")
             .field("eyeColor")
             .field("name.first")
             .field("name.last")
             .build()
  }
];

console.log(process.argv[2]);
console.log(jsonCsvMapper.materialize(
  JSON.parse(fs.readFileSync(cases[process.argv[2]].file, 'utf8')),
    cases[process.argv[2]].mapping));

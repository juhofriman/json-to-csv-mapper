'use strict';

var fs = require('fs');
var jsonCsvMapper = require('./');

var cases = [
  { // Just simple test, adds header row and uses callbacks
    file: "./battle-test-data/contacts.json",
    mapping: jsonCsvMapper.spec({addHeader: true})
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
  { // Uses nested fields
    file: "./battle-test-data/nested-contacts.json",
    mapping: jsonCsvMapper.spec()
             .field("age")
             .field("eyeColor")
             .field("name.first")
             .field("name.last")
             .build()
  },
  { // Does aggregate nested object into single field
    file: "./battle-test-data/nested-contacts.json",
    mapping: jsonCsvMapper.spec()
             .field("age")
             .field("eyeColor")
             .field("name").valueCallbacks(
               function(name) { return name.first + " " + name.last; })
             .build()
  },
  { // This one adds header row and "formats" date
    file: "./battle-test-data/punches.json",
    mapping: jsonCsvMapper.spec({addHeader: true})
             .field("id")
             .field("hit")
             .field("time").valueCallbacks(
               function(time) {
                 // Here you would use something like moment.js for formatting date
                 // Now we return epoch because we don't want additional dependencies here
                 return Date.parse(time);
               })
             .build()
  }
];

if(process.argv.length < 3) {
  console.log("Pass case index as an argument");
  process.exit(1);
}

console.log(jsonCsvMapper.materialize(
  JSON.parse(fs.readFileSync(cases[process.argv[2]].file, 'utf8')),
    cases[process.argv[2]].mapping));

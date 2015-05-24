'use strict';

var fs = require('fs');
var jsonCsvMapper = require('./');

console.time("time");

var cases = [
  { // Just simple test, adds header row and uses callbacks
    file: "./battle-test-data/contacts.json",
    mapping: jsonCsvMapper.spec({addHeader: true})
               .field("_.id")
               .field("guid")
               .field("isActive").mapping({false: "disabled", true: "active"})
               .field("balance")
               .field("picture")
               .field("age")
               .field("eyeColor")
               .field("gender").callback(function(data) { return data.toUpperCase(); })
               .field("email")
               .field("phone")
               .field("address").escape()
               .field("about").escape()
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
             .field("name").callback(function(name) {
                 return name.first + " " + name.last;
               })
             .build()
  },
  { // Simple three fields and no processing
    file: "./battle-test-data/punches.json",
    mapping: jsonCsvMapper.spec({addHeader: true})
             .field("id")
             .field("hit")
             .field("time")
             .build()
  },
  { // This one adds header row and "formats" date
    file: "./battle-test-data/punches.json",
    mapping: jsonCsvMapper.spec({addHeader: true})
             .field("id")
             .field("hit")
             .field("time").callback(function(time) {
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

if(process.argv.indexOf("--time") > -1) {
  jsonCsvMapper.materialize(
    JSON.parse(fs.readFileSync(cases[process.argv[2]].file, 'utf8')),
      cases[process.argv[2]].mapping);
  console.timeEnd("time");
} else {
  console.log(jsonCsvMapper.materialize(
    JSON.parse(fs.readFileSync(cases[process.argv[2]].file, 'utf8')),
      cases[process.argv[2]].mapping));
}

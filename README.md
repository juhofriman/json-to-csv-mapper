# [![Build Status](https://travis-ci.org/juhofriman/json-to-csv-mapper.svg?branch=master)](https://travis-ci.org/juhofriman/json-to-csv-mapper)

> It maps json to csv using builder for defining mapping


## Install

```sh
$ npm install --save json-csv-mapper
```


## Usage

Naming of functions is due to change. Note also that it does not quarantee to produce valid csv if your spec() does not handle values correctly.

```js
var jsonCsvMapper = require('json-csv-mapper');

// When you have an array of json objects
var data = [
  { id: 1,
    sex: 2,
    name: {
      first: "Jack",
      last: "Kerouac"
    },
    about: "He's super interesting writer and \"boheme\"" },
  { id: 2,
    sex: 2,
    name: {
      first: "Ernest",
      last: "Hemingway"
    },
    about: "He wrote \"The Man and the Sea\"" },
  { id: 3,
    sex: 1,
    name: {
      first: "Jane",
      last: "Austen"
    },
    about: "was an English novelist whose works of romantic fiction" },
];

// You can map them to csv using builder spec
var csvStr = jsonCsvMapper.materialize(data, jsonCsvMapper.spec()
        .field("id")
        .field("sex").valueMapping({1: "female", 2: "male"})
        .field("name.first")
        .field("name.last")
        .field("about").escape()
        .build());


// Should output
1,male,Jack,Kerouac,"He's super interesting writer and ""boheme"""
2,male,Ernest,Hemingway,"He wrote ""The Man and the Sea"""
3,female,Jane,Austen,"was an English novelist whose works of romantic fiction"

// You can get header fields and use callback functions for formatting values (even nested values like in this case)
// If you have date data you can use something like moment.js for formatting on those callbacks
var csvStr = jsonCsvMapper.materialize(data, jsonCsvMapper.spec({addHeader: true})
        .field("id")
        .field("sex").valueMapping({1: "female", 2: "male"})
        .field("name").callback(function(name) { return name.first + " " + name.last; })
        .field("about").escape()
        .build());

// Should output
id,sex,name,about
1,male,Jack Kerouac,"He's super interesting writer and ""boheme"""
2,male,Ernest Hemingway,"He wrote ""The Man and the Sea"""
3,female,Jane Austen,"was an English novelist whose works of romantic fiction"

```
What a nice piece of software!


## License

MIT © [Juho Friman]()


[npm-image]: https://badge.fury.io/js/json-csv-mapper.svg
[npm-url]: https://npmjs.org/package/json-csv-mapper
[travis-image]: https://travis-ci.org/juhofriman/json-csv-mapper.svg?branch=master
[travis-url]: https://travis-ci.org/juhofriman/json-csv-mapper
[daviddm-image]: https://david-dm.org/juhofriman/json-csv-mapper.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/juhofriman/json-csv-mapper

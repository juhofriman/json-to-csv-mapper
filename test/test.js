'use strict';
var assert = require('assert');
var jsonCsvMapper = require('../');

describe('json-csv-mapper node module', function () {

  it('must publish convenience builder for mapping spec', function() {
    assert.deepEqual(jsonCsvMapper.spec().build().fields, []);
    assert.deepEqual(jsonCsvMapper.spec().field("bar").build().fields, [{f: "bar", cb: []}]);
    assert.deepEqual(jsonCsvMapper.spec().field("bar").field("foo.baz").build().fields,
                    [{f: "bar", cb: []}, {f: "foo.baz", cb: []}]);
  });

  it('must allow building field definition with value mappings', function() {
    assert.deepEqual(jsonCsvMapper.spec()
                     .field("bar")
                     .mapping({true: "1", false: "0"})
                     .build().fields,
                     [{f: "bar", cb: [], m: {true: "1", false: "0"}}]);
  });

  it('must barf if mapping(m) m is not a map', function() {
      assert.throws(function() {
        jsonCsvMapper.spec().field("bar").mapping("Can't use me for mapping!");
      });
  });

  it('must allow building field definition with value callbacks', function() {
    var fooFunc = function(data) { return data; };
    var barFunc = function(data) { return data; };

    // Callbacks must be empty is none is given
    assert.deepEqual(jsonCsvMapper.spec()
                     .field("bar")
                     .build().fields[0].cb,
                     []);

    // When added callback must exist in callback array
    assert.deepEqual(jsonCsvMapper.spec()
                     .field("bar")
                     .callback(fooFunc)
                     .build().fields[0].cb,
                     [fooFunc]);

    // Callbacks can be chained
    var chainedCallbacksSpec = jsonCsvMapper.spec()
                              .field("bar")
                              .callback(fooFunc)
                              .callback(barFunc).build();

    assert.deepEqual(chainedCallbacksSpec.fields[0].cb[0],
                     fooFunc);
    assert.deepEqual(chainedCallbacksSpec.fields[0].cb[1],
                     barFunc);
  });

  it('must barf if callback given is not a function', function() {
    assert.throws(function() {
        jsonCsvMapper.spec().field("bar").callback("Can't call me");
      });
  });

  it('must offer function for building escaped field', function() {
    assert(jsonCsvMapper.spec()
                     .field("bar")
                     .escape()
                     .build().fields[0].cb[0]);
  });

  it('must map empty objects to empty "rows"', function() {
    assert.deepEqual(jsonCsvMapper.jsonToArray([{}], jsonCsvMapper.spec().build()),
                     [[]]);

    assert.deepEqual(jsonCsvMapper.jsonToArray([{}, {}], jsonCsvMapper.spec().build()),
                     [[], []]);

    assert.deepEqual(jsonCsvMapper.jsonToArray([{}, {}, {}], jsonCsvMapper.spec().build()),
                     [[], [], []]);
  });

  it('must forget fields not in mapping spec', function() {
    // It's possible that this actually should barf?
    assert.deepEqual(jsonCsvMapper.jsonToArray([{}], jsonCsvMapper.spec().field("foo").field("bar").build()),
                     [[]]);
  });

  it('must map simple field really simply', function () {
    assert.deepEqual(jsonCsvMapper.jsonToArray([{foo: "Bar"}],
                                               jsonCsvMapper.spec().field("foo").build()),
                    [["Bar"]]);

    assert.deepEqual(jsonCsvMapper.jsonToArray([{foo: "Bar"}, {foo: "Baz"}],
                                             jsonCsvMapper.spec().field("foo").build()),
                    [["Bar"], ["Baz"]]);

    assert.deepEqual(jsonCsvMapper.jsonToArray([{foo: "Bar", character: "Dilbert"},
                                                {foo: "Baz", character: "Garfield"}],
                                               jsonCsvMapper.spec().field("foo").field("character").build()),
                     [["Bar", "Dilbert"], ["Baz", "Garfield"]]);
  });

  it('must support nested mappings', function() {
    assert.deepEqual([["Baz"]],
                     jsonCsvMapper.jsonToArray([{foo: { bar: "Baz" }}],
                                               jsonCsvMapper.spec().field("foo.bar").build()));
  });

  it('must support deeply nested mappings', function(){
    assert.deepEqual(jsonCsvMapper.jsonToArray([{foo: {
                                                  deeply: {
                                                    nested: { bar: "Baz",
                                                              nothere: "Can't seemee!" }
                                                  },
                                                  secrets: "Only secrets here",
                                                  ignoredPath: {} }}],
                                               jsonCsvMapper.spec().field("foo.deeply.nested.bar").field("foo.secrets").build()),
                     [["Baz", "Only secrets here"]]);
  });

  it('must run callback if given', function() {
    assert.deepEqual(jsonCsvMapper.jsonToArray([{foo: "bar"}],
                                               jsonCsvMapper.spec().field("foo")
                                                 .callback(
                                                   function(data) {return data.toUpperCase(); }).build()),
                    [["BAR"]]);

  });

  it('must allow running callbacks to nested fields for formatting', function() {
    assert.deepEqual(jsonCsvMapper.jsonToArray([{name: {first: "Rick", last: "Wakeman"}}],
                                               jsonCsvMapper.spec().field("name")
                                                 .callback(
                                                   function(data) {return data.first + " " + data.last;}).build()),
                    [["Rick Wakeman"]]);
  });


  it('must run multiple callbacks if multiple callbacks are chained', function() {
    assert.deepEqual(jsonCsvMapper.jsonToArray([{foo: "bar"}],
                                               jsonCsvMapper.spec().field("foo")
                                                 .callback(function(data) {
                                                   return '"' + data + '"';
                                                 })
                                                 .callback(function(data) {
                                                    return data.toUpperCase();
                                                 })
                                                 .build()),
                    [["\"BAR\""]]);
  });

  it('must escape contained " when escape is registered to field', function() {
    assert.deepEqual(jsonCsvMapper.jsonToArray([{foo: 'this "is" it!'}],
                                               jsonCsvMapper.spec().field("foo").escape().build()),
                    [['"this ""is"" it!"']]);
    assert.deepEqual(jsonCsvMapper.jsonToArray([{foo: 'Yo """" man!'}],
                                               jsonCsvMapper.spec().field("foo").escape().build()),
                    [['"Yo """""""" man!"']]);

  });

  it('must support value mapping', function() {
    assert.deepEqual(jsonCsvMapper.jsonToArray([{name: "Jill", sex: 1},
                                               {name: "Jack", sex: 2}],
                                               jsonCsvMapper.spec()
                                                 .field("name")
                                                 .field("sex").mapping({1: "female", 2: "male"})
                                                 .build()),
                    [["Jill", "female"], ["Jack", "male"]]);

  });

  it('must support value mapping with functions', function() {
    assert.deepEqual(jsonCsvMapper.jsonToArray([{name: "Jill", sex: 1},
                                               {name: "Jack", sex: 2}],
                                               jsonCsvMapper.spec()
                                                 .field("name")
                                                 .field("sex").mapping(
                                                   {1: function(data) { return "func1-" + data; },
                                                    2: function(data) { return "func2-" + data; } })
                                                 .build()),
                    [["Jill", "func1-1"], ["Jack", "func2-2"]]);

  });

  it('must support both functions and values in mappings simultaneously', function() {
    assert.deepEqual(jsonCsvMapper.jsonToArray([{ field: "value1"},
                                                { field: "value2"}],
                                              jsonCsvMapper.spec()
                                               .field("field")
                                               .mapping({"value1": function(key) { return "function1:" + key; },
                                                         "value2": "direct value" })
                                               .build()),
                     [["function1:value1"],["direct value"]]);
  });

  it('must add field names header if requested', function() {
    assert.deepEqual(jsonCsvMapper.jsonToArray([],
                                               jsonCsvMapper.spec({addHeader: true})
                                                .field("foo")
                                                .field("bar")
                                                .field("baz")
                                                .build()),
                    [["foo", "bar", "baz"]]);
  });

  it('must materialize csv as string', function() {
    assert.equal(jsonCsvMapper.materialize([{foo: "bar", bar: "baz"}],
                                           jsonCsvMapper.spec().field("foo").field("bar").build()),
                "bar,baz\n");
  });

});

'use strict';
var assert = require('assert');
var jsonCsvMapper = require('../');

describe('json-csv-mapper node module', function () {

  it('must publish convenience builder for mapping spec', function() {
    assert.deepEqual(jsonCsvMapper.spec().build().fields, []);
    assert.deepEqual(jsonCsvMapper.spec().field("bar").build().fields, [{f: "bar"}]);
    assert.deepEqual(jsonCsvMapper.spec().field("bar").field("foo.baz").build().fields,
                    [{f: "bar"}, {f: "foo.baz"}]);
  });

  it('must allow building field definition with value mappings', function() {
    assert.deepEqual(jsonCsvMapper.spec().
                     field("bar").
                     valueMapping({true: "1", false: "0"}).
                     build().fields,
                    [{f: "bar", m: {true: "1", false: "0"}}]);
  });

  it('must allow building field definition with value callbacks', function() {
    var fooFunc = function(data) { return data; };
    var barFunc = function(data) { return data; };

    assert.deepEqual(jsonCsvMapper.spec().
                     field("bar").
                     valueCallbacks().
                     build().fields,
                     [{f: "bar", cb: []}]);

    assert.deepEqual(jsonCsvMapper.spec().
                     field("bar").
                     valueCallbacks(fooFunc).
                     build().fields,
                     [{f: "bar", cb: [fooFunc]}]);

    assert.deepEqual(jsonCsvMapper.spec().
                     field("bar").
                     valueCallbacks(fooFunc, barFunc).
                     build().fields,
                     [{f: "bar", cb: [fooFunc, barFunc]}]);
  });

  it('must offer function for building escaped field', function() {
    assert.deepEqual(jsonCsvMapper.spec()
                     .field("bar")
                     .escape()
                     .build().fields,
                     [{f: "bar", cb: [jsonCsvMapper.CB_QUOTE]}]);
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
                                                 .valueCallbacks(
                                                   function(data) {return data.toUpperCase(); }).build()),
                    [["BAR"]]);

  });

  it('must allow running callbacks to nested fields for formatting', function() {
    assert.deepEqual(jsonCsvMapper.jsonToArray([{name: {first: "Rick", last: "Wakeman"}}],
                                               jsonCsvMapper.spec().field("name")
                                                 .valueCallbacks(
                                                   function(data) {return data.first + " " + data.last;}).build()),
                    [["Rick Wakeman"]]);
  });

  it('must publish common use callbacks', function() {
    // No it must not. Use builder for these. This is implemented as escape() for now
    assert.deepEqual(jsonCsvMapper.jsonToArray([{foo: "bar"}],
                                             jsonCsvMapper.spec().field("foo").valueCallbacks(jsonCsvMapper.CB_QUOTE).build()),
                    [["\"bar\""]]);
  });

  it('must run multiple callbacks if cb is an array', function() {
    // No, builder should publish single callback(fn) which can be chained
    assert.deepEqual(jsonCsvMapper.jsonToArray([{foo: "bar"}],
                                               jsonCsvMapper.spec().field("foo")
                                                 .valueCallbacks(jsonCsvMapper.CB_QUOTE,
                                                    function(data) {return data.toUpperCase(); }).build()),
                    [["\"BAR\""]]);
  });

  it('must escape contained " when CB_QUOTE callback is invoked', function() {
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
                                                 .field("sex").valueMapping({1: "female", 2: "male"})
                                                 .build()),
                    [["Jill", "female"], ["Jack", "male"]]);

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

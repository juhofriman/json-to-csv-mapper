'use strict';
var assert = require('assert');
var jsonCsvMapper = require('../');

describe('json-csv-mapper node module', function () {

  it('must publish convenience builder for mapping spec', function() {
    assert.deepEqual([], jsonCsvMapper.spec().build().fields);
    assert.deepEqual([{f: "bar"}], jsonCsvMapper.spec().field("bar").build().fields);
    assert.deepEqual([{f: "bar"}, {f: "foo.baz"}],
                     jsonCsvMapper.spec().field("bar").field("foo.baz").build().fields);
  });

  it('must allow building field definition with value mappings', function() {
    assert.deepEqual([{f: "bar", m: {true: "1", false: "0"}}],
                     jsonCsvMapper.spec().
                     field("bar").
                     valueMapping({true: "1", false: "0"}).
                     build().fields);
  });

  it('must allow building field definition with value callbacks', function() {
    var fooFunc = function(data) { return data; };
    var barFunc = function(data) { return data; };

    assert.deepEqual([{f: "bar", cb: []}],
                     jsonCsvMapper.spec().
                     field("bar").
                     valueCallbacks().
                     build().fields);

    assert.deepEqual([{f: "bar", cb: [fooFunc]}],
                     jsonCsvMapper.spec().
                     field("bar").
                     valueCallbacks(fooFunc).
                     build().fields);

    assert.deepEqual([{f: "bar", cb: [fooFunc, barFunc]}],
                     jsonCsvMapper.spec().
                     field("bar").
                     valueCallbacks(fooFunc, barFunc).
                     build().fields);
  });

  it('must offer function for building escaped field', function() {
    assert.deepEqual([{f: "bar", cb: [jsonCsvMapper.CB_QUOTE]}],
                     jsonCsvMapper.spec()
                     .field("bar")
                     .escape()
                     .build().fields);
  });

  it('must map empty objects to empty "rows"', function() {
    assert.deepEqual([[]], jsonCsvMapper.jsonToArray([{}], jsonCsvMapper.spec().build()));
    assert.deepEqual([[], []], jsonCsvMapper.jsonToArray([{}, {}], jsonCsvMapper.spec().build()));
    assert.deepEqual([[], [], []], jsonCsvMapper.jsonToArray([{}, {}, {}], jsonCsvMapper.spec().build()));
  });

  it('must forget fields not in mapping spec', function() {
    // It's possible that this actually should barf?
    assert.deepEqual([[]], jsonCsvMapper.jsonToArray([{}], jsonCsvMapper.spec().field("foo").field("bar").build()));
  });

  it('must map simple field really simply', function () {
    assert.deepEqual([["Bar"]],
                     jsonCsvMapper.jsonToArray([{foo: "Bar"}], jsonCsvMapper.spec().field("foo").build()));
    assert.deepEqual([["Bar"], ["Baz"]],
                     jsonCsvMapper.jsonToArray([{foo: "Bar"}, {foo: "Baz"}],
                                             jsonCsvMapper.spec().field("foo").build()));
    assert.deepEqual([["Bar", "Dilbert"], ["Baz", "Garfield"]],
                     jsonCsvMapper.jsonToArray(
                       [{foo: "Bar", character: "Dilbert"},
                        {foo: "Baz", character: "Garfield"}],
                       jsonCsvMapper.spec().field("foo").field("character").build()));
  });

  it('must support nested mappings', function() {
    assert.deepEqual([["Baz"]],
                     jsonCsvMapper.jsonToArray([{foo: { bar: "Baz" }}],
                                               jsonCsvMapper.spec().field("foo.bar").build()));
  });

  it('must support deeply nested mappings', function(){
    assert.deepEqual([["Baz", "Only secrets here"]],
                     jsonCsvMapper.jsonToArray(
                       [{foo: { deeply: { nested: {bar: "Baz", nothere: "Can't seemee!"}},
                               secrets: "Only secrets here",
                               ignoredPath: {} }}],
                       jsonCsvMapper.spec().field("foo.deeply.nested.bar").field("foo.secrets").build()));
  });

  it('must run callback if given', function() {
    assert.deepEqual([["BAR"]],
                     jsonCsvMapper.jsonToArray([{foo: "bar"}],
                                               jsonCsvMapper.spec().field("foo").valueCallbacks(
                                                 function(data) {return data.toUpperCase(); }).build()));

  });

  it('must allow running callbacks to nested fields for formatting', function() {
    assert.deepEqual([["Rick Wakeman"]],
                     jsonCsvMapper.jsonToArray([{name: {first: "Rick", last: "Wakeman"}}],
                                               jsonCsvMapper.spec().field("name").valueCallbacks(
                                                 function(data) {return data.first + " " + data.last;}).build()));
  });

  it('must publish common use callbacks', function() {
    assert.deepEqual([["\"bar\""]],
                     jsonCsvMapper.jsonToArray([{foo: "bar"}],
                                             jsonCsvMapper.spec().field("foo").valueCallbacks(jsonCsvMapper.CB_QUOTE).build()));
  });

  it('must run multiple callbacks if cb is an array', function() {
    assert.deepEqual([["\"BAR\""]],
                     jsonCsvMapper.jsonToArray([{foo: "bar"}],
                                               jsonCsvMapper.spec().field("foo").valueCallbacks(jsonCsvMapper.CB_QUOTE,
                                                    function(data) {return data.toUpperCase(); }).build()));
  });

  it('must escape contained " when CB_QUOTE callback is invoked', function() {
    assert.deepEqual([['"this ""is"" it!"']],
                     jsonCsvMapper.jsonToArray([{foo: 'this "is" it!'}],
                                             jsonCsvMapper.spec().field("foo").escape().build()));
    assert.deepEqual([['"Yo """""""" man!"']],
                     jsonCsvMapper.jsonToArray([{foo: 'Yo """" man!'}],
                                             jsonCsvMapper.spec().field("foo").escape().build()));

  });

  it('must support value mapping', function() {
    assert.deepEqual([["Jill", "female"], ["Jack", "male"]],
                     jsonCsvMapper.jsonToArray([{name: "Jill", sex: 1},
                                               {name: "Jack", sex: 2}],
                                               jsonCsvMapper.spec().field("name").field("sex").valueMapping({1: "female", 2: "male"}).build()));

  });

  it('must add field names header if requested', function() {
    assert.deepEqual([["foo", "bar", "baz"]],
                     jsonCsvMapper.jsonToArray([], jsonCsvMapper.spec({addHeader: true})
                                              .field("foo")
                                              .field("bar")
                                              .field("baz")
                                              .build()));
  });

  it('must materialize csv as string', function() {
    assert.equal("bar,baz\n", jsonCsvMapper.materialize([{foo: "bar", bar: "baz"}],
                                                      jsonCsvMapper.spec().field("foo").field("bar").build()));
  });

});

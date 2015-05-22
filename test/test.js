'use strict';
var assert = require('assert');
var jsonCsvMapper = require('../');

describe('json-csv-mapper node module', function () {

  it('must publish convenience builder for mapping spec', function() {
    assert.deepEqual([], jsonCsvMapper.spec().build());
    assert.deepEqual([{f: "bar"}], jsonCsvMapper.spec().field("bar").build());
    assert.deepEqual([{f: "bar"}, {f: "foo.baz"}],
                     jsonCsvMapper.spec().field("bar").field("foo.baz").build());
  });

  it('must allow building field definition with value mappings', function() {
    assert.deepEqual([{f: "bar", m: {true: "1", false: "0"}}],
                     jsonCsvMapper.spec().
                     field("bar").
                     valueMapping({true: "1", false: "0"}).
                     build());
  });

  it('must allow building field definition with value callbacks', function() {
    var fooFunc = function(data) { return data; };
    var barFunc = function(data) { return data; };

    assert.deepEqual([{f: "bar", cb: []}],
                     jsonCsvMapper.spec().
                     field("bar").
                     valueCallbacks().
                     build());

    assert.deepEqual([{f: "bar", cb: [fooFunc]}],
                     jsonCsvMapper.spec().
                     field("bar").
                     valueCallbacks(fooFunc).
                     build());

    assert.deepEqual([{f: "bar", cb: [fooFunc, barFunc]}],
                     jsonCsvMapper.spec().
                     field("bar").
                     valueCallbacks(fooFunc, barFunc).
                     build());
  });

  it('must offer function for building escaped field', function() {
    assert.deepEqual([{f: "bar", cb: [jsonCsvMapper.CB_QUOTE]}],
                     jsonCsvMapper.spec()
                     .field("bar")
                     .escape()
                     .build());
  });

  it('must map empty objects to empty "rows"', function() {
    assert.deepEqual([[]], jsonCsvMapper.jsonToArray([{}], [{}]));
    assert.deepEqual([[], []], jsonCsvMapper.jsonToArray([{}, {}], [{}]));
    assert.deepEqual([[], [], []], jsonCsvMapper.jsonToArray([{}, {}, {}], [{}]));
  });

  it('must forget fields not is mapping spec', function() {
    // It's possible that this actually should barf?
    assert.deepEqual([[]], jsonCsvMapper.jsonToArray([{}], [{"f": "foo"}, {"f": "bar"}]));
  });

  it('must map simple field really simply', function () {
    assert.deepEqual([["Bar"]],
                     jsonCsvMapper.jsonToArray([{foo: "Bar"}], [{"f": "foo"}]));
    assert.deepEqual([["Bar"], ["Baz"]],
                     jsonCsvMapper.jsonToArray([{foo: "Bar"}, {foo: "Baz"}],
                                             [{"f": "foo"}]));
    assert.deepEqual([["Bar", "Dilbert"], ["Baz", "Garfield"]],
                     jsonCsvMapper.jsonToArray(
                       [{foo: "Bar", character: "Dilbert"},
                        {foo: "Baz", character: "Garfield"}],
                       [{"f": "foo"}, {"f": "character"}]));
  });

  it('must support nested mappings', function() {
    assert.deepEqual([["Baz"]],
                     jsonCsvMapper.jsonToArray([{foo: { bar: "Baz" }}], [{"f": "foo.bar"}]));
  });

  it('must support deeply nested mappings', function(){
    assert.deepEqual([["Baz", "Only secrets here"]],
                     jsonCsvMapper.jsonToArray(
                       [{foo: { deeply: { nested: {bar: "Baz", nothere: "Can't seemee!"}},
                               secrets: "Only secrets here",
                               ignoredPath: {} }}],
                       [{"f": "foo.deeply.nested.bar"}, {"f": "foo.secrets"}]));
  });

  it('must run callback if given', function() {
    assert.deepEqual([["BAR"]],
                     jsonCsvMapper.jsonToArray([{foo: "bar"}],
                                             [{"f": "foo", cb: function(data) {return data.toUpperCase(); }}]));
  });

  it('must allow running callbacks to nested fields for formatting', function() {
    assert.deepEqual([["Rick Wakeman"]],
                     jsonCsvMapper.jsonToArray([{name: {first: "Rick", last: "Wakeman"}}],
                                             [{"f": "name", cb: function(data) {return data.first + " " + data.last; }}]));
  });

  it('must publish common use callbacks', function() {
    assert.deepEqual([["\"bar\""]],
                     jsonCsvMapper.jsonToArray([{foo: "bar"}],
                                             [{"f": "foo", cb: jsonCsvMapper.CB_QUOTE }]));
  });

  it('must run multiple callbacks if cb is an array', function() {
    assert.deepEqual([["\"BAR\""]],
                     jsonCsvMapper.jsonToArray([{foo: "bar"}],
                                             [{"f": "foo",
                                               cb: [jsonCsvMapper.CB_QUOTE,
                                                    function(data) {return data.toUpperCase(); }]} ]));
  });

  it('must escape contained " when CB_QUOTE callback is invoked', function() {
    assert.deepEqual([['"this ""is"" it!"']],
                     jsonCsvMapper.jsonToArray([{foo: 'this "is" it!'}],
                                             [{"f": "foo", cb: jsonCsvMapper.CB_QUOTE }]));
    assert.deepEqual([['"Yo """""""" man!"']],
                     jsonCsvMapper.jsonToArray([{foo: 'Yo """" man!'}],
                                             [{"f": "foo", cb: jsonCsvMapper.CB_QUOTE }]));

  });

  it('must support value mapping', function() {
    assert.deepEqual([["Jill", "female"], ["Jack", "male"]],
                     jsonCsvMapper.jsonToArray([{name: "Jill", sex: 1},
                                               {name: "Jack", sex: 2}],
                                              [{f: "name"},
                                               {f: "sex", m: {1: "female", 2: "male"}}]));
  });

  it('must materialize csv as string', function() {
    assert.equal("bar,baz\n", jsonCsvMapper.materialize([{foo: "bar", bar: "baz"}],
                                                      [{f: "foo"}, {f: "bar"}]));
  });

});

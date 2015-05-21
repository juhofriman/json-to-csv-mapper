'use strict';
var assert = require('assert');
var jsonCsvMapper = require('../');

describe('json-csv-mapper node module', function () {
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

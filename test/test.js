'use strict';
var assert = require('assert');
var jsonCsvMapper = require('../');

describe('json-csv-mapper node module', function () {
  it('must map empty objects to empty "rows"', function() {
    assert.deepEqual([[]], jsonCsvMapper.jsonToCsv([{}], [{}]));
    assert.deepEqual([[], []], jsonCsvMapper.jsonToCsv([{}, {}], [{}]));
    assert.deepEqual([[], [], []], jsonCsvMapper.jsonToCsv([{}, {}, {}], [{}]));
  });
  it('must forget fields not is mapping spec', function() {
    // It's possible that this actually should barf?
    assert.deepEqual([[]], jsonCsvMapper.jsonToCsv([{}], [{"f": "foo"}, {"f": "bar"}]));
  });
  it('must map simple field really simply', function () {
    assert.deepEqual([["Bar"]],
                     jsonCsvMapper.jsonToCsv([{foo: "Bar"}], [{"f": "foo"}]));
    assert.deepEqual([["Bar"], ["Baz"]],
                     jsonCsvMapper.jsonToCsv([{foo: "Bar"}, {foo: "Baz"}],
                                             [{"f": "foo"}]));
    assert.deepEqual([["Bar", "Dilbert"], ["Baz", "Garfield"]],
                     jsonCsvMapper.jsonToCsv(
                       [{foo: "Bar", character: "Dilbert"},
                        {foo: "Baz", character: "Garfield"}],
                       [{"f": "foo"}, {"f": "character"}]));
  });
  it('must support nested mappings', function() {
    assert.deepEqual([["Baz"]],
                     jsonCsvMapper.jsonToCsv([{foo: { bar: "Baz" }}], [{"f": "foo.bar"}]));
  });
  it('must support deeply nested mappings', function(){
      assert.deepEqual([["Baz", "Only secrets here"]],
                     jsonCsvMapper.jsonToCsv(
                       [{foo: { deeply: { nested: {bar: "Baz", nothere: "Can't seemee!"}},
                               secrets: "Only secrets here",
                               ignoredPath: {} }}],
                       [{"f": "foo.deeply.nested.bar"}, {"f": "foo.secrets"}]));
  });
});

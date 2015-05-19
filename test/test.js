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
});

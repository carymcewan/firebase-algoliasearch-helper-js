'use strict';

var test = require('tape');

test('hierarchical facets: show parent level', function (t) {
  var algoliasearch = require('algoliasearch');
  var sinon = require('sinon');

  var algoliasearchHelper = require('../../../');

  var appId = 'hierarchical-simple-appId';
  var apiKey = 'hierarchical-simple-apiKey';
  var indexName = 'hierarchical-simple-indexName';

  var client = algoliasearch(appId, apiKey);
  var helper = algoliasearchHelper(client, indexName, {
    hierarchicalFacets: [{
      name: 'categories',
      attributes: ['categories.lvl0', 'categories.lvl1'],
      separator: ' | ',
      showParentLevel: true
    }]
  });

  helper.toggleRefine('categories', 'beers | IPA');

  var search = sinon.stub(client, 'search');

  var algoliaResponse = {
    'results': [{
      'query': 'a',
      'index': indexName,
      'hits': [{ 'objectID': 'one' }, { 'objectID': 'two' }],
      'nbHits': 2,
      'page': 0,
      'nbPages': 1,
      'hitsPerPage': 20,
      'facets': {
        'categories.lvl0': { 'beers': 2 },
        'categories.lvl1': { 'beers | IPA': 2 }
      }
    }, {
      'query': 'a',
      'index': indexName,
      'hits': [{ 'objectID': 'one' }],
      'nbHits': 1,
      'page': 0,
      'nbPages': 1,
      'hitsPerPage': 1,
      'facets': {
        'categories.lvl0': { 'beers': 3 },
        'categories.lvl1': { 'beers | IPA': 2, 'beers | Belgian': 1 }
      }
    }, {
      'query': 'a',
      'index': indexName,
      'hits': [{ 'objectID': 'one' }],
      'nbHits': 1,
      'page': 0,
      'nbPages': 1,
      'hitsPerPage': 1,
      'facets': {
        'categories.lvl0': { 'beers': 3 }
      }
    }]
  };

  var expectedHelperResponse = [{
    'name': 'categories',
    'count': null,
    'isRefined': true,
    'path': null,
    'data': [{
      'name': 'beers',
      'path': 'beers',
      'count': 3,
      'isRefined': true,
      'data': [{
        'name': 'IPA',
        'path': 'beers | IPA',
        'count': 2,
        'isRefined': true,
        'data': null
      }, {
        'name': 'Belgian',
        'path': 'beers | Belgian',
        'count': 1,
        'isRefined': false,
        'data': null
      }]
    }]
  }];

  search.yieldsAsync(null, algoliaResponse);
  helper.setQuery('a').search();
  helper.once('result', function (content) {
    t.ok(search.calledOnce, 'client.search was called once');
    t.deepEqual(content.hierarchicalFacets, expectedHelperResponse);
    t.end();
  });
});
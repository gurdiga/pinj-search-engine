'use strict';

// http://instante.justice.md/apps/citatii_judecata/citatii.php
var SummonsSection = {
  toString: function() {
    return 'Citaţii în instanţă';
  },

  subsectionNames: ['persoana_citata', 'reclamantul'],

  getAPIRequestParams: function(fieldName, clientName) {
    return {
      url: 'http://instante.justice.md/apps/citatii_judecata/citatii_grid.php',
      searchOptions: getSearchOptions(fieldName, clientName)
    };

    function getSearchOptions(fieldName, query) {
      var RULE_PER_QUERY_TYPE = {
        'caseNumber': [
          {'field': 'nr_dosar', 'op': 'cn', 'data': query.substr(1)}
        ],
        'name': [
          {'field': fieldName, 'op': 'cn', 'data': query}
        ]
      };

      var searchOptions = {
        '_search': true,
        'nd': Date.now(),
        'rows': 500,
        'page': 1,
        'sidx': 'judecatoria_vizata desc, judecatoria_vizata',
        'sord': 'desc',
        'filters': {
          'groupOp': 'AND',
          'rules': RULE_PER_QUERY_TYPE[queryType(query)]
        }
      };

      searchOptions.filters = JSON.stringify(searchOptions.filters);

      return searchOptions;
    }
  },

  getRowDate: function(row) {
    var dateString = row[2];
    return dateFromDateString(dateString);
  },

  columns: [
    {
      'title': 'Persoana vizată',
      'getName': getName,
      'show': true
    }, {
      'title': 'Calitatea procesuală',
      'getRole': getRole,
      'show': true
    }, {
      'title': 'Data şedinţei',
      'index': 2,
      'show': true
    }, {
      'title': 'Ora şedinţei',
      'index': 3,
      'show': true
    }, {
      'title': 'Instanţa',
      'index': 7,
      'show': true
    }, {
      'title': 'Obiectul examinării',
      'index': 5,
      'show': true
    }, {
      'title': 'Numărul dosarului',
      'index': 1,
      'show': true
    }, {
      'title': 'SKIP',
      'index': 0,
      'show': false
    }, {
      'title': 'Pîrît',
      'index': 4,
      'used': true
    }, {
      'title': 'Reclamant',
      'index': 6,
      'used': true
    }, {
      'title': 'Judecător',
      'index': 8,
      'show': false
    }, {
      'title': 'Persoana responsabilă',
      'index': 9,
      'show': false
    }, {
      'title': 'Contacte',
      'index': 10,
      'show': false
    }, {
      'title': 'Data publicării',
      'index': 11,
      'show': false
    }
  ]
};

function getName(row, fieldName) {
  var accuser = row[6];
  var culprit = row[4];

  if (fieldName === 'persoana_citata') {
    return culprit;
  } else {
    return accuser;
  }
}

function getRole(row, fieldName) {
  if (fieldName === 'persoana_citata') {
    return 'pîrît';
  } else {
    return 'reclamant';
  }
}

module.exports = SummonsSection;

var queryType = require('app/util/query-type');
var dateFromDateString = require('app/util/date-from-date-string');

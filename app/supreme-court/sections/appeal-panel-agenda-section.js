'use strict';
// http://agenda.csj.md/contestatii_csm.php

var AppealPanelAgendaSection = {};

AppealPanelAgendaSection.inquireAbout = function(clientName) {
  return forEach(['only one'])
    .inParallel(getResults)
    .then(attachColumns(columns));

  function getResults() {
    var apiRequestOptions = getAPIOptions(clientName);

    return queryAPI(apiRequestOptions)
      .then(extractRows(addPdfUrl));

    function addPdfUrl(row, id) {
      row.pdfUrl = 'http://agenda.csj.md/pdf_creator_contestatii_csm.php?id=' + id;
      return row;
    }
  }
};

function getAPIOptions(clientName) {
  return {
    url: 'http://agenda.csj.md/contestatii_csm_grid.php',
    searchOptions: getSearchOptions(clientName)
  };

  function getSearchOptions(clientName) {
    var searchOptions = {
      '_search': true,
      'nd': Date.now(),
      'rows': 500,
      'page': 1,
      'sidx': 'data_sedinta desc, data_sedinta',
      'sord': 'desc',
      'filters': {
        'groupOp': 'AND',
        'rules': [
          {'field': 'data_sedinta', 'op': 'cn', 'data': (new Date()).getFullYear()},
          {'field': 'partea_dosar', 'op': 'cn', 'data': clientName}
        ]
      }
    };

    searchOptions.filters = JSON.stringify(searchOptions.filters);

    return searchOptions;
  }
}

var columns = [
  {
    'title': 'Numărul dosarului',
    'index': 1,
    'show': true
  }, {
    'title': 'Părţile dosarului',
    'index': 2,
    'show': true
  }, {
    'title': 'Hotărîrea contestată',
    'index': 3,
    'show': true
  }, {
    'title': 'Data şedinţei',
    'index': 4,
    'show': true
  }, {
    'title': 'Ora şedinţei',
    'index': 5,
    'show': true
  }, {
    'title': 'Sala',
    'index': 6,
    'show': true
  }, {
    'title': 'Informaţii adiţionale',
    'index': 7,
    'show': true
  }, {
    'title': 'Data publicării',
    'index': 8,
    'show': true
  }, {
    'title': 'PDF',
    'index': 'pdfUrl',
    'link': true,
    'show': true
  }
];

AppealPanelAgendaSection.toString = function() {
  return 'Agenda şedinţelor Completului pentru examinarea contestaţiilor asupra hotărîrilor CSM';
};

module.exports = AppealPanelAgendaSection;

var forEach = require('../../util/for-each');
var queryAPI = require('../../util/query-api');
var attachColumns = require('../../util/attach-columns');
var extractRows = require('../../util/extract-rows');

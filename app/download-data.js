'use strict';

module.exports = downloadData;
module.exports.getFilePath = getFilePath;

var DELAY_BETWEEN_REQUESTS = 125;
var DATA_DIR = './app/data/';

function downloadData() {
  var levels = [
    DistrictCourts,
    SupremeCourt
  ];

  prepareDataDirectory();

  return forEach(levels).inSeries(function(sections) {
    return forEach(sections).inSeries(function(section) {
      return forEach(section.subsectionNames).inSeries(function(subsectionName) {
        /*global gc*/
        gc();

        var filePath = getFilePath(sections, section, subsectionName);

        console.log('');
        console.log(filePath);

        if (fs.existsSync(filePath)) return Q.Promise.resolve();

        return collectAllRows()
        .then(removeDiacritics)
        .then(saveToFile(filePath));

        function collectAllRows() {
          var startPage = 1;
          var allRows = [];

          return requestNextPage(startPage, allRows);
        }

        function requestNextPage(pageNumber, allRows) {
          var apiRequestParams = section.getAPIRequestParamsForBulkDownload(subsectionName, pageNumber);

          return queryAPI(apiRequestParams)
          .then(collectRowsInto(allRows))
          .then(delay(DELAY_BETWEEN_REQUESTS))
          .then(requestNextPagesWhileThereIsPossiblyMoreData(pageNumber));

          function requestNextPagesWhileThereIsPossiblyMoreData(pageNumber) {
            return function(numberOfRowsFetchedWithLastRequest) {
              var isTherePossiblyMoreData = numberOfRowsFetchedWithLastRequest === BulkDownloadOptions.PAGE_SIZE;

              if (isTherePossiblyMoreData) return requestNextPage(pageNumber + 1, allRows);
              else return Q.Promise.resolve(allRows);
            };
          }
        }
      });
    });
  })
  .catch(function(e) {
    process.stdout.write(e.stack);
    console.log('');
  });
}

function prepareDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
    return;
  }

  var fileNames = fs.readdirSync(DATA_DIR);

  fileNames.forEach(removeFile);

  function removeFile(fileName) {
    fs.unlinkSync(DATA_DIR + fileName);
  }
}

function collectRowsInto(array) {
  return function(result) {
    var rows = result.rows.map(function(row) { return row.cell; });
    array.push.apply(array, rows);

    process.stdout.write('.');

    return result.rows.length;
  };
}

function delay(ms) {
  return function(v) {
    return Q.Promise(function(resolve) {
      global.setTimeout(function() {
        resolve(v);
      }, ms);
    });
  };
}

/*
function extractRows(section) {
  return function(result) {
    return result.rows
    .filter(withValidID)
    .filter(withValidData)
    .filter(relevant)
    .map(extractData);
  };

  function withValidID(row) {
    return !!row.id;
  }

  function withValidData(row) {
    return !!row.cell;
  }

  function relevant(row) {
    return isSearchResultRecentEnough(section, row.cell);
  }

  function extractData(row) {
    var rowData = row.cell;
    rowData.push(row.id);
    return rowData;
  }
}
*/

function removeDiacritics(rows) {
  // TODO: figure out how
  return rows;
}

function saveToFile(filePath) {
  return function(rows) {
    fs.writeFileSync(filePath, JSON.stringify(rows, null, 2));
  };
}

function getFilePath(sections, section, subsectionName) {
  return DATA_DIR + [sections.slugName, section.slugName, subsectionName].join('-') + '.json';
}

var SupremeCourt = require('app/supreme-court');
var DistrictCourts = require('app/district-courts');
var forEach = require('app/util/for-each');
var queryAPI = require('app/util/query-api');
var BulkDownloadOptions = require('app/util/get-bulk-download-options');

var fs = require('fs');
var Q = require('q');

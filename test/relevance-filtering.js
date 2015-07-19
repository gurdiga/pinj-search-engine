'use strict';

describe('Relevance filtering', function() {
  var section, row;

  describe('district courts', function() {
    describe('AgendaSection', function() {
      beforeEach(function() {
        section = require('app/district-courts/sections/agenda-section');
        row = [
          null,
          '03-09-2015',
          '10:30',
          null,
          '02-2a-8340-29042015',
          'Romanescu Constantin vs Ministerul Justitiei',
          null,
          'Sala nr.1 bd.Stefan cel Mare 73',
          null,
          null,
          null
        ];
      });

      it('has a getRowDate(row) method', function() {
        expect(section.getRowDate, 'AgendaSection.getRowDate').to.be.a('function');
      });

      it('getRowDate(row) returns the appropriate date when present', function() {
        var rowDate = section.getRowDate(row);
        expect(rowDate.getDate()).to.equal(3);
        expect(rowDate.getMonth()).to.equal(8);
        expect(rowDate.getFullYear()).to.equal(2015);
      });

      it('getRowDate() returns current date when not present', function() {
        row[1] = undefined;
        var today = new Date();
        var rowDate = section.getRowDate(row);
        expect(rowDate.getDate()).to.equal(today.getDate());
        expect(rowDate.getMonth()).to.equal(today.getMonth());
        expect(rowDate.getFullYear()).to.equal(today.getFullYear());
      });

      it('getRowDate() returns current date when date is likely invalid', function() {
        row[1] = '23-23-2015';
        var today = new Date();
        var rowDate = section.getRowDate(row);
        expect(rowDate.getDate()).to.equal(today.getDate());
        expect(rowDate.getMonth()).to.equal(today.getMonth());
        expect(rowDate.getFullYear()).to.equal(today.getFullYear());
      });
    });

    [{
      section: require('app/district-courts/sections/case-inquiry-section'),
      sampleRow: [
        null,
        '51-4-3403-08112010',
        'Romanescu Constantin Cosmin',
        'Contravenţie administrativă',
        'Alte contraventii',
        'Incheiat',
        'Ungheni',
        null,
        null
      ],
      fileNumberColumnIndex: 1,
      expectedDate: new Date('2010-11-08')
    }, {
      section: require('app/district-courts/sections/sentence-section'),
      sampleRow: [
        '<a href="get_decision_doc.php?..." target="_blank">PDF_doc</a>',
        null,
        '02-2r-19549-31102014',
        'Romanescu Constantin vs Ex.Cogilnicean Victor',
        null,
        null,
        null,
        null
      ],
      fileNumberColumnIndex: 2,
      expectedDate: new Date('2014-10-31')
    }].forEach(function(item) {
      testDateExtractionFromFileNumber(
          item.section,
          item.sampleRow,
          item.fileNumberColumnIndex,
          item.expectedDate
      );
    });

    function testDateExtractionFromFileNumber(section, row, columnIndex, expectedDate) {
      describe(section.toString(), function() {
        it('has a getRowDate(row) method', function() {
          expect(section.getRowDate, 'CaseInquirySection.getRowDate').to.be.a('function');
        });

        it('extracts the date from file number', function() {
          var rowDate = section.getRowDate(row); // 08112010
          expect(rowDate.getDate(), 'day of month').to.equal(expectedDate.getDate());
          expect(rowDate.getMonth(), 'month').to.equal(expectedDate.getMonth());
          expect(rowDate.getFullYear(), 'year').to.equal(expectedDate.getFullYear());
        });

        it('returns current date when there is no file number', function() {
          row[columnIndex] = '';
          var rowDate = section.getRowDate(row);
          var currentDate = new Date();
          expect(rowDate.getDate(), 'day of month').to.equal(currentDate.getDate());
          expect(rowDate.getMonth(), 'month').to.equal(currentDate.getMonth());
          expect(rowDate.getFullYear(), 'year').to.equal(currentDate.getFullYear());
        });

        it('returns current date when file number is null', function() {
          row[columnIndex] = null;
          var rowDate = section.getRowDate(row);
          var currentDate = new Date();
          expect(rowDate.getDate(), 'day of month').to.equal(currentDate.getDate());
          expect(rowDate.getMonth(), 'month').to.equal(currentDate.getMonth());
          expect(rowDate.getFullYear(), 'year').to.equal(currentDate.getFullYear());
        });

        it('returns current date when can’t extract date from file number', function() {
          row[columnIndex] = 'some-garbage-1234';
          var rowDate = section.getRowDate(row);
          var currentDate = new Date();
          expect(rowDate.getDate(), 'day of month').to.equal(currentDate.getDate());
          expect(rowDate.getMonth(), 'month').to.equal(currentDate.getMonth());
          expect(rowDate.getFullYear(), 'year').to.equal(currentDate.getFullYear());
        });

        it('returns current date when the extracted date is invalid', function() {
          row[columnIndex] = 'some-garbage-12345678';
          var rowDate = section.getRowDate(row);
          var currentDate = new Date();
          expect(rowDate.getDate(), 'day of month').to.equal(currentDate.getDate());
          expect(rowDate.getMonth(), 'month').to.equal(currentDate.getMonth());
          expect(rowDate.getFullYear(), 'year').to.equal(currentDate.getFullYear());
        });
      });
    }

    describe('SummonsSection', function() {
    });
  });

  describe('supreme court', function() {
    describe('CaseInquirySection', function() {
    });

    describe('CivilianCollegeAgendaSection', function() {
    });

    describe('CivilianCollegeSentenceSection', function() {
    });

    describe('CriminalCollegeAgendaSection', function() {
    });

    describe('CriminalCollegeSentenceSection', function() {
    });

    describe('CriminalPlenumAgendaSection', function() {
    });

    describe('CriminalPlenumAgendaSection', function() {
    });
  });
});

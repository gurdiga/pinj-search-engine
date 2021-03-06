'use strict';

describe('getUserList', function() {
  var preparedUser;
  var userData = {
    'clients': '',
    'timestamps': {
      'lastSearch': 1321343414543
    }
  };
  var allUserData = { 'test@example:com': userData };

  beforeEach(function() {
    this.sinon.stub(Data, 'get').withArgs('/data');
    this.sinon.stub(console, 'timeEnd');
    this.sinon.stub(console, 'log');
  });

  describe('with an empty list', function() {
    beforeEach(function() {
      Data.get.returns(Q.resolve({}));
    });

    it('resolves to an empty list', function() {
      return expect(getUserList()).to.eventually.deep.equal([]);
    });
  });

  describe('preparation', function() {
    beforeEach(function() {
      Data.get.returns(Q.resolve(allUserData));

      return getUserList().then(function(preparedUsers) {
        expect(preparedUsers).to.have.length(1);
        preparedUser = preparedUsers[0];
      });
    });

    describe('client list', function() {
      describe('generally', function() {
        beforeEach(function() {
          return prepareUserWithClients('John Doe\nJane Doe');
        });

        it('parses the client list into an array by splitting it by \n', function() {
          expect(preparedUser.clientList).to.be.an('array');
          expect(preparedUser.clientList).to.deep.equal(['John Doe', 'Jane Doe']);
        });
      });

      describe('duplicate items', function() {
        beforeEach(function() {
          return prepareUserWithClients('John Doe\nJohn Doe');
        });

        it('excludes duplicates', function() {
          expect(preparedUser.clientList).to.deep.equal(['John Doe']);
        });
      });

      describe('white-space normalization', function() {
        beforeEach(function() {
          return prepareUserWithClients('\tJohn   Doe   \n   \n\n');
        });

        it('normalizes the white-space', function() {
          expect(preparedUser.clientList).to.deep.equal(['John Doe']);
        });
      });

      describe('length validation', function() {
        beforeEach(function() {
          return prepareUserWithClients('Joe\nJohn Doe\nBob\nAlice');
        });

        it('excludes client names that are too short', function() {
          expect(preparedUser.clientList).to.deep.equal(['John Doe', 'Alice']);
        });
      });

      function prepareUserWithClients(clients) {
        userData.clients = clients;

        return getUserList().then(function(preparedUsers) {
          preparedUser = preparedUsers[0];
        });
      }
    });

    it('infers the email from aid', function() {
      expect(preparedUser.email).to.equal('test@example.com');
    });

    it('remembers the aid', function() {
      expect(preparedUser.aid).to.equal('test@example:com');
    });

    it('remembers the lastSearch', function() {
      expect(preparedUser).to.have.property('lastSearch')
      .that.is.equal(userData.timestamps.lastSearch);
    });

    it('add the toString() method which returns the email', function() {
      expect(preparedUser.toString()).to.equal(preparedUser.email);
    });
  });

  describe('filtering', function() {
    beforeEach(function() {
      Data.get.returns(Q.resolve(allUserData));
    });

    describe('cover run', function() {
      beforeEach(function() {
        var aFewMinutes = 4 * 60 * 1000;

        allUserData['already-served@test:com'] = {
          'timestamps': {
            'lastSearch': Date.now() - aFewMinutes
          }
        };
      });

      it('excludes users that were served on the first run', function() {
        return getUserList().then(function(preparedUsers) {
          preparedUsers.forEach(function(user) {
            expect(user.aid).not.to.equal('already-served@test:com');
          });
        });
      });
    });

    describe('development mode', function() {
      var initialiNodeEnv;

      beforeEach(function() {
        initialiNodeEnv = process.env.NODE_ENV;
      });

      afterEach(function() {
        process.env.NODE_ENV = initialiNodeEnv;
      });

      beforeEach(function() {
        process.env.NODE_ENV = 'development';

        allUserData['gurdiga@gmail:com'] = { 'timestamps': {} };
        allUserData['gurdiga+1@gmail:com'] = { 'timestamps': {} };
        allUserData['gurdiga+2@gmail:com'] = { 'timestamps': {} };
        allUserData['gurdiga+3@gmail:com'] = { 'timestamps': {} };
      });

      it('only returns users with email matching gurdiga.*@gmail.com', function() {
        return getUserList().then(function(preparedUsers) {
          preparedUsers.forEach(function(user) {
            expect(user.email).to.match(/gurdiga.*@gmail.com/);
          });
        });
      });
    });

    describe('test accounts', function() {
      beforeEach(function() {
        allUserData['test@test:com'] = { 'timestamps': {} };
        allUserData['test1@test:com'] = { 'timestamps': {} };
        allUserData['test2@test:com'] = { 'timestamps': {} };
      });

      it('excludes users with the @test.com emails', function() {
        return getUserList().then(function(preparedUsers) {
          preparedUsers.forEach(function(user) {
            expect(user.email, 'this user should have been excluded').not.to.match(/.*@test.com/);
          });
        });
      });
    });
  });
});

var getUserList = require('app/get-user-lists');
var Data = require('app/util/data');
var Q = require('q');

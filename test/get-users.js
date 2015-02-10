'use strict';

describe('getUsers', function() {
  var preparedUser;
  var userData = {
    'clients': '',
    'timestamps': {
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
      Data.get.returns(Promise.resolve({}));
    });

    it('resolves to an empty list', function() {
      return expect(getUsers()).to.eventually.deep.equal([]);
    });
  });

  describe('preparation', function() {
    beforeEach(function() {
      Data.get.returns(Promise.resolve(allUserData));

      return getUsers().then(function(preparedUsers) {
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

        return getUsers().then(function(preparedUsers) {
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

    it('add the toString() method which returns the email', function() {
      expect(preparedUser.toString()).to.equal(preparedUser.email);
    });

    var oneDay = 24 * 3600 * 1000;

    describe('trial detection', function() {
      var registration;

      describe('when user is in their trial period', function() {
        beforeEach(function() {
          registration = Date.now() - (config.TRIAL_PERIOD - oneDay);
          return prepareUserWith('registration', registration);
        });

        it('marks the user as trial', function() {
          expect(preparedUser).to.have.property('isTrial').that.is.true;
        });
      });

      describe('when user’s trial ended', function() {
        beforeEach(function() {
          registration = Date.now() - (config.TRIAL_PERIOD + oneDay);
          return prepareUserWith('registration', registration);
        });

        it('marks the user as trial', function() {
          expect(preparedUser).not.to.have.property('isTrial');
        });
      });
    });

    describe('payer detection', function() {
      var lastPayment;

      describe('when user has never paid', function() {
        beforeEach(function() {
          lastPayment = undefined;
          return prepareUserWith('lastPayment', lastPayment);
        });

        it('is not considered a payer', function() {
          expect(preparedUser).not.to.have.property('isPayer');
        });
      });

      describe('when user has paid less than (a payment period + a grace period) ago', function() {
        beforeEach(function() {
          lastPayment = Date.now() - (config.SUBSCRIPTION_PERIOD + config.GRACE_PERIOD - oneDay);
          return prepareUserWith('lastPayment', lastPayment);
        });

        it('is considered a payer', function() {
          expect(preparedUser).to.have.property('isPayer').that.is.true;
        });
      });

      describe('when user has paid more than (a payment period + a grace period) ago', function() {
        beforeEach(function() {
          lastPayment = Date.now() - (config.SUBSCRIPTION_PERIOD + config.GRACE_PERIOD + oneDay);
          return prepareUserWith('lastPayment', lastPayment);
        });

        it('is not considered a payer', function() {
          expect(preparedUser).not.to.have.property('isPayer');
        });
      });
    });

    function prepareUserWith(timestampName, value) {
      userData.timestamps[timestampName] = value;

      return getUsers().then(function(preparedUsers) {
        preparedUser = preparedUsers[0];
      });
    }
  });

  describe('filtering', function() {
    beforeEach(function() {
      Data.get.returns(Promise.resolve(allUserData));
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
        return getUsers().then(function(preparedUsers) {
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
        return getUsers().then(function(preparedUsers) {
          preparedUsers.forEach(function(user) {
            expect(user.email, 'this user should have been excluded').not.to.match(/.*@test.com/);
          });
        });
      });
    });
  });
});

var getUsers = require('app/get-users');
var Data = require('util-data');
var config = require('pinj-config');
var Promise = require('app/util/promise');

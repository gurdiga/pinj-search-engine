'use strict';

module.exports = sendEmails;

function sendEmails(emails) {
  return forEach(emails).inParallel(function(meta) {
    var email = meta.label;
    var subject = 'Monitorul PINJ: informaţii despre clienţi';

    return Promise.resolve(extractBodies(meta))
    .then(sendEmail(email, subject));
  });
}

function extractBodies(meta) {
  return meta.results;
}

var forEach = require('app/util/for-each');
var sendEmail = require('app/util/send-email');
var Promise = require('app/util/promise');

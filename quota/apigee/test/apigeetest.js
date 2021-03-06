/****************************************************************************
 The MIT License (MIT)

 Copyright (c) 2013 Apigee Corporation

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/
'use strict';

var Spi = require('..');
var config = require('../../../testconfig/testconfig-apigee').config;
var assert = require('assert');
var random = Math.random();
var _ = require('underscore');
var should = require('should');

describe('Apigee', function() {

  this.timeout(120000);

  function id(_id) {
    return 'test:' + random + ":" + _id;
  }

  function checkResult(result, allowed, used, isAllowed) {
    assert(result);
    assert.equal(result.allowed, allowed);
    assert.equal(result.used, used);
    assert.equal(result.isAllowed, isAllowed);
  }

// clone & extend hash
  function extend(a, b) {
    return _.extend({}, a, b);
  }
  var pm;

  before(function() {
    var options = extend(config, {
      timeUnit: 'minute',
      interval: 1,
      allow: 2
    });
    pm = Spi.create(options);
  });

  describe('Rolling', function() {

    it('Minute', function(done) {
      var hit = { identifier: id('TimeOne'), weight: 1 };
      pm.apply(hit, function(err, result) {
        assert(!err);
        checkResult(result, 2, 1, true);
        result.expiryTime.should.be.approximately(Date.now() + 60000, 10000);

        var offset = result.expiryTime - (Date.now() + 60000);

        setTimeout(function() {
          pm.apply(hit, function(err, result) {
            assert(!err);
            checkResult(result, 2, 2, true);

            // Ensure quota is reset within a minute
            setTimeout(function() {
              pm.apply(hit, function(err, result) {
                assert(!err);
                checkResult(result, 2, 1, true);
                done();
              });
            }, 30001 + offset);

          });
        }, 30001);
      });
    });
  });

  describe('Basic', function() {
    it('Minute', function(done) {
      pm.apply({
        identifier: id('One'),
        weight: 1
      }, function(err, result) {
        assert(!err);
        checkResult(result, 2, 1, true);
        result.expiryTime.should.be.approximately(Date.now() + 60000, 10000);

        pm.apply({
          identifier: id('One'),
          weight: 1
        }, function(err, result) {
          assert(!err);
          checkResult(result, 2, 2, true);

          pm.apply({
            identifier: id('Two'),
            weight: 1
          }, function(err, result) {
            assert(!err);
            checkResult(result, 2, 1, true);
            done();
          });
        });
      });
    });
  });

});

/*
 * This little server runs the "expressserver" from the Quota tests using
 * the Apigee SPI.
 */

 var apigeeQuota = require('volos-quota-apigee');
 var config = require('./volos/testconfig/testconfig-apigee');
 var server = require('./volos/quota/test/expressserver');

 var quota = apigeeQuota.create(config.config);

 // Build an Express server using the code from the cache module
 var app = server(quota);

 app.listen(process.env.PORT || 9002);

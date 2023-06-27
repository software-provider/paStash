/*
   RFC3339 parser for @pastash/pastash
   (C) 2020 QXIP BV
*/

var base_filter = require('@pastash/pastash').base_filter,
  util = require('util'),
  logger = require('@pastash/pastash').logger;

const { parse_rfc3339, parse_nanos, parse_micros, now_rfc3339 } = require("@qxip/chrono-parse-rfc3339");

function FilterRFC3339() {
  base_filter.BaseFilter.call(this);
  this.mergeConfig({
    name: 'rfc3339',
    required_params: ['source'],
    optional_params: ['debug', 'mode', 'target'],
    default_values: {
      'debug': false,
      'target': 'rfc3339',
      'mode': 0 // 0 = rfc3339 to nano, 1 = nanos to rfc3339, 2 = micros to rfc3339
    },
    start_hook: this.start.bind(this)
  });
}

util.inherits(FilterRFC3339, base_filter.BaseFilter);

FilterRFC3339.prototype.start = function(callback) {
  logger.info('Initialized RFC3339 parser');
  switch (this.mode) {
  case 0:
    this.process = parse_rfc3339;
    break;
  case 1:
    this.process = parse_nanos;
    break;
  case 2:
    this.process = parse_micros;
    break;
  default:
    this.process = parse_rfc3339;
  }
  callback();
};

FilterRFC3339.prototype.process = function(data) {
  try {
     if (data[this.source]) {
      data[this.target] = this.process(data[this.source].toString());
     }
     return data;
  } catch(e){
     logger.error('error parsing time');
     return data;
  }
};

exports.create = function() {
  return new FilterRFC3339();
};

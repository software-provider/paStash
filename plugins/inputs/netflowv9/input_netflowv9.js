var base_input = require('@pastash/pastash').base_input,
  util = require('util'),
  logger = require('@pastash/pastash').logger;
  
var Collector = require('node-netflowv9');

function InputNetflowv9() {
  base_input.BaseInput.call(this);
  this.mergeConfig(this.unserializer_config());
  this.mergeConfig({
    name: 'Netflowv9',
    port_field: 'port',
    optional_params: ['uuid'],
    start_hook: this.start,
  });
}

util.inherits(InputNetflowv9, base_input.BaseInput);

InputNetflowv9.prototype.start = function(callback) {
  this.port = this.parsed_url.params.port;
  this.host = this.parsed_url.params.host;
  this.raw = this.parsed_url.params.raw ? this.parsed_url.params.raw : false;
  logger.info('Opening Netflowv9 socket on port '+this.port);

  this.socket = Collector({port: this.port });

  /*
  if (this.raw) {
          // disable template for v9 fields
	  for(i=1;i<99;i++){
	    if (this.socket.nfTypes[i]) this.socket.nfTypes[i].name = ''+i;
	  }
  }
  */

  this.socket.on("error", function (error) {
      logger.info('Netflowv9 Connection Error ' + JSON.stringify(error));
      this.emit('error', error);
  }).on("template", function (e) {
	if(!e) return;
	// console.log('TEMPLATE: ',e);
       	this.emit('template', e.templates[0]);
  }).on('data', function(data) {
      if (!data) return;
	// console.log('got data..');
        this.emit('data', data.flows);
  }.bind(this));

  callback();

};

InputNetflowv9.prototype.close = function(callback) {
  logger.info('Closing Netflowv9 socket');
  try { this.socket().close(); } catch(err){ console.log('failed killing socket...'); }
  callback();
};

exports.create = function() {
  return new InputNetflowv9();
};

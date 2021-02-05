'use strict';

var Message = require('../message');
var inherits = require('util').inherits;
var bitcore = require('bitcore-lib');
var BufferUtil = bitcore.util.buffer;

/**
 * Represents unknown message.
 * @extends Message
 * @constructor
 */
function UnknownMessage(arg, options) {
  Message.call(this, options);
  this.command = 'unknown';
}
inherits(UnknownMessage, Message);

UnknownMessage.prototype.setPayload = function() {};

UnknownMessage.prototype.getPayload = function() {
  return BufferUtil.EMPTY_BUFFER;
};

module.exports = UnknownMessage;

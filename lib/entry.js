'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _server = require('./server');

var _server2 = _interopRequireDefault(_server);

var _client = require('./client');

var _client2 = _interopRequireDefault(_client);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (parameters) {
  var chunks = parameters.chunks();
  var cacheConfig = parameters.configuration.cacheConfig;

  return {
    client: (0, _client2.default)(chunks),
    server: (0, _server2.default)(chunks, cacheConfig)
  };
};
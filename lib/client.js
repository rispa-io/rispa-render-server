'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _server = require('react-dom/server');

var _server2 = _interopRequireDefault(_server);

var _Html = require('./Html');

var _Html2 = _interopRequireDefault(_Html);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var createRender = function createRender(assets) {
  return function (req, res) {
    var html = '<!doctype html>\n' + _server2.default.renderToStaticMarkup(_react2.default.createElement(_Html2.default, { assets: assets }));

    res.send(html);
  };
};

exports.default = createRender;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _values = require('babel-runtime/core-js/object/values');

var _values2 = _interopRequireDefault(_values);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _class, _temp, _class2, _temp2;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var loadChunksOnClient = function loadChunksOnClient() {
  var chunks = window.RISPA_CHUNKS;
  var loadedChunksCount = 0;

  var loadScript = function loadScript(src, handler) {
    var script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = handler;
    document.body.appendChild(script);
  };

  var chunkLoadedHandler = function chunkLoadedHandler() {
    loadedChunksCount += 1;
    if (loadedChunksCount === chunks.length) {
      // Schedule application start for next tick for break long frames
      setTimeout(window.startApp, 0);
    }
  };

  var loadChunk = function loadChunk(chunk) {
    return loadScript(chunk, chunkLoadedHandler);
  };

  if (chunks.length) {
    chunks.forEach(loadChunk);
  } else {
    setTimeout(window.startApp, 0);
  }
};

var InitialState = (_temp = _class = function (_PureComponent) {
  (0, _inherits3.default)(InitialState, _PureComponent);

  function InitialState() {
    (0, _classCallCheck3.default)(this, InitialState);
    return (0, _possibleConstructorReturn3.default)(this, (InitialState.__proto__ || (0, _getPrototypeOf2.default)(InitialState)).apply(this, arguments));
  }

  (0, _createClass3.default)(InitialState, [{
    key: 'render',
    value: function render() {
      return this.props.state ? _react2.default.createElement('script', {
        dangerouslySetInnerHTML: {
          __html: '\n            // <![CDATA[\n            window.RISPA_INITIAL_STATE=' + this.props.state + ';\n            // ]]>\n          '
        },
        charSet: 'UTF-8'
      }) : null;
    }
  }]);
  return InitialState;
}(_react.PureComponent), _class.propTypes = {
  state: _propTypes.string
}, _temp);
var Html = (_temp2 = _class2 = function (_PureComponent2) {
  (0, _inherits3.default)(Html, _PureComponent2);

  function Html() {
    (0, _classCallCheck3.default)(this, Html);
    return (0, _possibleConstructorReturn3.default)(this, (Html.__proto__ || (0, _getPrototypeOf2.default)(Html)).apply(this, arguments));
  }

  (0, _createClass3.default)(Html, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          assets = _props.assets,
          content = _props.content,
          initialState = _props.initialState;


      var bootstrapScript = null;
      var chunks = [];
      (0, _values2.default)(assets.javascript).forEach(function (script) {
        if (/bootstrap/.test(script)) {
          bootstrapScript = script;
        } else {
          chunks.push(script);
        }
      });

      return _react2.default.createElement(
        'html',
        { lang: 'ru-RU' },
        _react2.default.createElement(
          'head',
          null,
          _react2.default.createElement('link', { rel: 'shortcut icon', href: '/favicon.ico' }),
          _react2.default.createElement('meta', { name: 'viewport', content: 'width=device-width, initial-scale=1' }),
          (0, _keys2.default)(assets.styles).map(function (style) {
            return _react2.default.createElement('link', {
              href: assets.styles[style],
              key: style,
              media: 'screen, projection',
              rel: 'stylesheet',
              type: 'text/css',
              charSet: 'UTF-8'
            });
          })
        ),
        _react2.default.createElement(
          'body',
          null,
          _react2.default.createElement('div', { id: 'root', dangerouslySetInnerHTML: { __html: content || '' } }),
          _react2.default.createElement('script', { src: bootstrapScript, charSet: 'UTF-8' }),
          _react2.default.createElement('script', {
            dangerouslySetInnerHTML: {
              __html: '\n                // <![CDATA[\n                window.RISPA_CHUNKS=' + (0, _stringify2.default)(chunks) + ';\n                (' + loadChunksOnClient.toString() + '());\n                // ]]>\n              '
            },
            charSet: 'UTF-8'
          }),
          _react2.default.createElement(InitialState, { state: initialState })
        )
      );
    }
  }]);
  return Html;
}(_react.PureComponent), _class2.propTypes = {
  assets: (0, _propTypes.objectOf)(_propTypes.object),
  content: _propTypes.string,
  initialState: _propTypes.string
}, _temp2);
exports.default = Html;
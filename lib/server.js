'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _electrodeReactSsrCaching = require('electrode-react-ssr-caching');

var _electrodeReactSsrCaching2 = _interopRequireDefault(_electrodeReactSsrCaching);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _server = require('react-dom/server');

var _server2 = _interopRequireDefault(_server);

var _createMemoryHistory = require('history/createMemoryHistory');

var _createMemoryHistory2 = _interopRequireDefault(_createMemoryHistory);

var _webpackFlushChunks = require('webpack-flush-chunks');

var _webpackFlushChunks2 = _interopRequireDefault(_webpackFlushChunks);

var _reactTreeWalker = require('react-tree-walker');

var _reactTreeWalker2 = _interopRequireDefault(_reactTreeWalker);

var _index = require('../../rispa-redux/src/index');

var _index2 = require('../../rispa-routes/index');

var _index3 = _interopRequireDefault(_index2);

var _reactCookie = require('react-cookie');

var _reactLoadable = require('react-loadable');

var _Html = require('./Html');

var _Html2 = _interopRequireDefault(_Html);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var stats = void 0;

var renderAndProfile = function renderAndProfile(App, ssrProfilePath) {
  for (var i = 0; i < 10; i += 1) {
    _server2.default.renderToString(App);
  }

  _electrodeReactSsrCaching2.default.clearProfileData();
  _electrodeReactSsrCaching2.default.enableProfiling();
  var content = _server2.default.renderToString(App);
  _electrodeReactSsrCaching2.default.enableProfiling(false);

  _fs2.default.writeFileSync(ssrProfilePath, (0, _stringify2.default)(_electrodeReactSsrCaching2.default.profileData, null, 2));

  return content;
};

var createRender = function createRender(assets, cacheConfig) {
  return function (req, res, config) {
    var statsPath = _path2.default.resolve(config.outputPath, './stats.json');
    var ssrProfilePath = _path2.default.resolve(config.outputPath, './ssr-profile.json');

    if (!stats) {
      stats = JSON.parse(String(_fs2.default.readFileSync(statsPath)));
    }

    if (process.env.NODE_ENV === 'production') {
      _electrodeReactSsrCaching2.default.enableCaching();
      _electrodeReactSsrCaching2.default.setCachingConfig(cacheConfig);
    }

    var location = req.originalUrl;
    var cookies = req.universalCookies;
    var history = (0, _createMemoryHistory2.default)();
    var store = (0, _index.configureStore)(history);
    var when = (0, _index.createWhen)(store);
    var routes = (0, _index3.default)({ store: store, when: when, cookies: cookies });

    store.dispatch((0, _index.replace)(location));

    var App = _react2.default.createElement(
      _index.Provider,
      { store: store },
      _react2.default.createElement(
        _reactCookie.CookiesProvider,
        { cookies: cookies },
        _react2.default.createElement(
          _index.ConnectedRouter,
          { history: history },
          routes
        )
      )
    );

    (0, _reactTreeWalker2.default)(App, when.loadOnServer).then(function () {
      var _store$getState = store.getState(),
          router = _store$getState.router;

      var newLocation = '' + router.location.pathname + router.location.search;
      if (newLocation !== location) {
        res.redirect(302, newLocation);
        return;
      }

      var content = process.env.PROFILE_SSR ? renderAndProfile(App, ssrProfilePath) : _server2.default.renderToString(App);

      var rootDir = _path2.default.resolve(process.cwd());
      var paths = (0, _reactLoadable.flushWebpackRequireWeakIds)().map(function (p) {
        return _path2.default.relative(rootDir, p).replace(/\\/g, '/');
      });
      var flushedAssets = (0, _webpackFlushChunks2.default)(paths, stats, {
        rootDir: rootDir
      });
      assets.javascript = flushedAssets.scripts.reduce(function (newScripts, script) {
        var key = script.replace(/\.js$/, '');
        newScripts[key] = config.publicPath.replace(/\/$/, '') + '/' + script;
        return newScripts;
      }, {});

      var html = '<!doctype html>\n' + _server2.default.renderToStaticMarkup(_react2.default.createElement(_Html2.default, {
        assets: assets,
        content: content,
        initialState: (0, _stringify2.default)(store.getState())
      }));

      res.send(html);
    });
  };
};

exports.default = createRender;
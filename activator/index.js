const ServerPluginApi = require('@rispa/server')
const WebpackPluginApi = require('@rispa/webpack')
const BabelPluginApi = require('@rispa/babel').default
const ConfigPluginApi = require('@rispa/config').default
const RenderServerPlugin = require('./RenderServerPlugin')
const RenderServerPluginApi = require('./RenderServerPluginApi')

module.exports.default = RenderServerPlugin

module.exports.api = RenderServerPluginApi

module.exports.after = [
  ConfigPluginApi.pluginName,
  ServerPluginApi.pluginName,
  WebpackPluginApi.pluginName,
  BabelPluginApi.pluginName,
]

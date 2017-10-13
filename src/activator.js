const ServerPluginApi = require('@rispa/server')
const WebpackPluginApi = require('@rispa/webpack')
const { default: BabelPluginApi } = require('@rispa/babel')
const RenderServerPlugin = require('./RenderServerPlugin')

module.exports.default = RenderServerPlugin

module.exports.after = [
  ServerPluginApi.pluginName,
  WebpackPluginApi.pluginName,
  BabelPluginApi.pluginName,
]

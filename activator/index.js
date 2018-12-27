const ServerPluginApi = require('@rispa/server')
const WebpackPluginApi = require('@rispa/webpack')
const RenderServerPlugin = require('./RenderServerPlugin')
const RenderServerPluginApi = require('./RenderServerPluginApi')

module.exports.default = RenderServerPlugin

module.exports.api = RenderServerPluginApi

module.exports.after = [
  ServerPluginApi.pluginName,
  WebpackPluginApi.pluginName,
]

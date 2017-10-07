const RenderServerPlugin = require('../src/RenderServerPlugin')
const ServerPluginApi = require('@rispa/server')
const WebpackPluginApi = require('@rispa/webpack')
const { default: BabelPluginApi } = require('@rispa/babel')

function init(context, config) {
  return new RenderServerPlugin(context, config)
}

const after = [
  ServerPluginApi.pluginName,
  WebpackPluginApi.pluginName,
  BabelPluginApi.pluginName
]

module.exports = init

module.exports.after = after

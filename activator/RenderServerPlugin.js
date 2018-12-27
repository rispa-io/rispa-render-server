const { PluginInstance } = require('@rispa/core')
const ServerPluginApi = require('@rispa/server')
const WebpackPluginApi = require('@rispa/webpack')

const serverWebpackConfig = require('./configs/server.wpc')

class RenderServerPlugin extends PluginInstance {
  constructor(context) {
    super(context)

    this.server = context.get(ServerPluginApi.pluginName)
    this.webpack = context.get(WebpackPluginApi.pluginName)

    this.render = this.render.bind(this)
  }

  start() {
    this.server.setServerRender(this.render)

    this.webpack.addServerConfig(serverWebpackConfig)
  }

  render() {
    // TODO
  }
}

module.exports = RenderServerPlugin

const { PluginApi } = require('@rispa/core')

class RenderServerPluginApi extends PluginApi {
  setCache(cache) {
    this.instance.setCache(cache)
  }
}

RenderServerPluginApi.pluginName = '@rispa/render-server'

module.exports = RenderServerPluginApi

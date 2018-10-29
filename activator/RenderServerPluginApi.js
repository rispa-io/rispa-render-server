const { PluginApi } = require('@rispa/core')

class RenderServerPluginApi extends PluginApi {
  static startHandler(context) {
    const instance = context.get(RenderServerPluginApi.pluginName)

    return instance.runBuild()
  }

  setCache(cache) {
    this.instance.setCache(cache)
  }

  runBuild() {
    return this.instance.runBuild()
  }
}

RenderServerPluginApi.pluginName = '@rispa/render-server'

module.exports = RenderServerPluginApi

const { PluginApi } = require('@rispa/core')

class RenderServerPluginApi extends PluginApi {}

RenderServerPluginApi.pluginName = '@rispa/render-server'

module.exports = RenderServerPluginApi

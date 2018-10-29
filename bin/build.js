const { init } = require('@rispa/core')
const { startHandler } = require('../activator/RenderServerPluginApi')

init(startHandler)

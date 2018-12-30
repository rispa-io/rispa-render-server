const { PluginInstance, createLogger } = require('@rispa/core')
const ServerPluginApi = require('@rispa/server')
const WebpackPluginApi = require('@rispa/webpack')
const BabelPluginApi = require('@rispa/babel').default
const ConfigPluginApi = require('@rispa/config').default

const serverWebpackConfig = require('./configs/server.wpc')
const serverBabelConfig = require('./configs/babel.config')

const logger = createLogger('@rispa/render-server')

const requireServerModule = module => {
  const modulePath = require.resolve(module)
  delete require.cache[modulePath]
  // eslint-disable-next-line import/no-dynamic-require,global-require
  return require(modulePath).default
}

class RenderServerPlugin extends PluginInstance {
  constructor(context) {
    super(context)

    this.server = context.get(ServerPluginApi.pluginName)
    this.webpack = context.get(WebpackPluginApi.pluginName)
    this.babel = context.get(BabelPluginApi.pluginName)
    this.config = context.get(ConfigPluginApi.pluginName).getConfig()

    this.createRender = this.createRender.bind(this)
  }

  start() {
    this.server.setServerRender(this.createRender)

    this.webpack.addServerConfig(serverWebpackConfig)

    this.babel.addServerConfig(serverBabelConfig)
  }

  createRender() {
    const { renderHtml } = this.config
    const compiler = this.webpack.getServerCompiler()

    let serverRender
    let onDone

    const render = async (req, assets) => {
      const result = await serverRender(req)

      return renderHtml(assets, result)
    }

    compiler.watch({
      aggregateTimeout: 300,
    }, (err, stats) => { // eslint-disable-line complexity
      if (err) {
        logger.error(err.stack || err)
        if (err.details) {
          logger.error(err.details)
        }
      }

      if (!err && !stats.hasErrors()) {
        serverRender = requireServerModule(compiler.options.output.path)
      } else {
        const statsString = stats.toString({
          colors: true,
        })
        if (statsString) {
          logger.info(statsString)
        }

        logger.error(logger.colors.red('Failed to compile server.'))
      }

      if (onDone) {
        onDone(render)
        onDone = false
      }
    })

    return new Promise(resolve => {
      onDone = resolve
    })
  }
}

module.exports = RenderServerPlugin

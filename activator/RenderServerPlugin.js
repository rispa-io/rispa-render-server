const path = require('path')
const webpack = require('webpack')
const createDebug = require('debug')
const ConfigPluginApi = require('@rispa/config').default
const { PluginInstance } = require('@rispa/core')
const ServerPluginApi = require('@rispa/server')
const WebpackPluginApi = require('@rispa/webpack')
const BabelPluginApi = require('@rispa/babel').default
// const {
//   server: startCompileRenderServer,
//   prepare: prepareConfig,
// } = require('universal-webpack')
const startCompileRenderServer = () => {
  throw new Error('Need fix')
}
const prepareConfig = () => {
  throw new Error('Need fix')
}
// const cookiesMiddleware = require('universal-cookie-express')
const cookiesMiddleware = () => {
  throw new Error('Need fix')
}
const serverConfiguration = require('./middleware/server')
const clientConfiguration = require('./middleware/client')

const babelConfig = require('./configs/babel-options')
const clientWebpackConfig = require('./configs/client.wpc')
const commonWebpackConfig = require('./configs/common.wpc')
const serverWebpackConfig = require('./configs/server.wpc')

const log = createDebug('rispa:info:render-server')
const logError = createDebug('rispa:error:render-server')

const logBuildResult = (err, stats) => {
  if (err) {
    logError('Failed to compile.')
    logError(err)
  } else if (stats.compilation.errors.length) {
    logError('Failed to compile.')
    stats.compilation.errors.forEach(error => {
      logError(error.message || error)
    })
  } else {
    log('Render server compiled successfully.')
  }
}

class RenderServerPlugin extends PluginInstance {
  constructor(context) {
    super(context)

    this.config = context.get(ConfigPluginApi.pluginName).getConfig()
    this.server = context.get(ServerPluginApi.pluginName)
    this.webpack = context.get(WebpackPluginApi.pluginName)
    this.babel = context.get(BabelPluginApi.pluginName)

    this.cache = {}

    this.universalSettings = {
      server: {
        input: path.resolve(__dirname, '../lib/entry.js'),
        output: path.resolve(this.config.outputPath, './server/server.js'),
      },
    }

    this.render = this.render.bind(this)
  }

  start() {
    this.server.setRenderMethod(this.render)

    this.babel.addConfig(babelConfig)

    this.webpack.addClientConfig(clientWebpackConfig)
    this.webpack.addCommonConfig(commonWebpackConfig)

    this.webpack.addClientMiddleware(webpackConfig => clientConfiguration(webpackConfig, this.universalSettings))
  }

  setCache(cache) {
    this.cache = cache
  }

  runBuild() {
    const config = this.webpack.getCommonConfig(serverWebpackConfig)
    const { compiler, start } = this.createRenderServer(config)

    start()

    compiler.run(logBuildResult)
  }

  createServerCompiler(webpackConfig) {
    const universalSettings = this.universalSettings

    prepareConfig(universalSettings, webpackConfig)

    const compiler = webpack(serverConfiguration(webpackConfig, universalSettings))
    const serverConfig = Object.assign(webpackConfig, {
      cacheConfig: {
        components: this.cache,
      },
    })

    return {
      compiler,
      start: () => startCompileRenderServer(serverConfig, universalSettings),
      universalSettings,
    }
  }

  createServerSideDevRender() {
    const config = this.webpack.getCommonConfig(serverWebpackConfig)
    const { compiler, start, universalSettings } = this.createServerCompiler(config)

    let render
    let asyncRender = start()

    compiler.watch({
      aggregateTimeout: 300,
    }, (err, stats) => {
      logBuildResult(err, stats)

      if (!err && !stats.compilation.errors.length) {
        delete require.cache[universalSettings.server.output]

        render = null
        asyncRender = start()
      }
    })

    return (req, res) => {
      if (render) {
        render(req, res, this.config)
      } else {
        asyncRender.then(newRender => {
          render = newRender
          render(req, res, this.config)
        })
      }
    }
  }

  createServerSideProdRender() {
    try {
      const configuration = Object.assign(this.webpack.getCommonConfig(serverWebpackConfig), {
        cacheConfig: {
          components: this.cache,
        },
      })

      // eslint-disable-next-line import/no-dynamic-require,global-require
      const { default: starter } = require(this.universalSettings.server.output)

      const chunksPath = path.resolve(configuration.output.path, 'webpack-chunks.json')
      // eslint-disable-next-line import/no-dynamic-require,global-require
      const chunks = require(chunksPath)

      const doRender = starter({
        configuration,
        chunks: () => chunks,
      })

      return (req, res) => doRender(req, res, this.config)
    } catch (error) {
      logError(error)
      logError('Failed to run prod server.')

      throw error
    }
  }

  createRender() {
    if (process.env.DISABLE_SSR) {
      return (req, res) => {
        console.log(res.locals)
        return 'TOOD'
      }
    }

    const doRender = process.env.NODE_ENV === 'production'
      ? this.createServerSideProdRender()
      : this.createServerSideDevRender()

    return doRender
  }

  render(app) {
    const doRender = this.createRender()

    // app.use(cookiesMiddleware()) TODO: Need fix

    app.get('*', (req, res) => {
      log(`request page '${req.originalUrl}'`)

      return doRender(req, res)
    })
  }
}

module.exports = RenderServerPlugin

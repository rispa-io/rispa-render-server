const path = require('path')
const webpack = require('webpack')
const createDebug = require('debug')
const ConfigPluginApi = require('@rispa/config').default
const { PluginInstance } = require('@rispa/core')
const ServerPluginApi = require('@rispa/server')
const WebpackPluginApi = require('@rispa/webpack')
const BabelPluginApi = require('@rispa/babel').default
const {
  server: startCompileRenderServer,
  prepare: prepareConfig
} = require('universal-webpack')
const cookiesMiddleware = require('universal-cookie-express')
const serverConfiguration = require('./middleware/server')
const clientConfiguration = require('./middleware/client')

const babelConfig = require('./configs/babel-options')
const clientWebpackConfig = require('./configs/client.wpc')
const commonWebpackConfig = require('./configs/client.wpc')

const log = createDebug('rispa:info:render-server')
const logError = createDebug('rispa:error:render-server')

const CLIENT_SIDE = 'client'
const SERVER_SIDE = 'server'

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
    this.side = process.env.DISABLE_SSR ? CLIENT_SIDE : SERVER_SIDE

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

    this.webpack.addClientConfig(commonWebpackConfig, clientWebpackConfig)
    this.webpack.addCommonConfig(commonWebpackConfig)

    this.webpack.addClientMiddleware(webpackConfig => clientConfiguration(webpackConfig, this.universalSettings))
  }

  setCache(cache) {
    this.cache = cache
  }

  createRenderServer(webpackConfig) {
    const universalSettings = this.universalSettings

    prepareConfig(universalSettings, webpackConfig)

    const compiler = webpack(serverConfiguration(webpackConfig, universalSettings))
    const serverConfig = Object.assign(webpackConfig, {
      cacheConfig: {
        components: this.cache,
      },
    })

    let render
    let asyncRender = startCompileRenderServer(serverConfig, universalSettings)

    if (process.env.NODE_ENV === 'production') {
      compiler.run(logBuildResult)
    } else {
      compiler.watch({
        aggregateTimeout: 300,
      }, (err, stats) => {
        logBuildResult(err, stats)

        if (!err && !stats.compilation.errors.length) {
          delete require.cache[universalSettings.server.output]

          render = null
          asyncRender = startCompileRenderServer(serverConfig, universalSettings)
        }
      })
    }

    return (side, req, res) => {
      if (render) {
        render[side](req, res, this.config)
      } else {
        asyncRender.then(newRender => {
          render = newRender
          render[side](req, res, this.config)
        })
      }
    }
  }

  render(app) {
    const config = this.webpack.getCommonConfig()

    const doRender = this.createRenderServer(config)

    app.use(cookiesMiddleware())

    app.get('/shell', (req, res) => {
      doRender(CLIENT_SIDE, req, res)
    })

    app.get('*', (req, res) => {
      doRender(this.side, req, res)
    })
  }
}

module.exports = RenderServerPlugin

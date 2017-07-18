import fs from 'fs'
import path from 'path'
import SSRCaching from 'electrode-react-ssr-caching'
import React from 'react'
import ReactDOM from 'react-dom/server'
import createHistory from 'history/createMemoryHistory'
import flushChunks from 'webpack-flush-chunks'
import reactTreeWalker from 'react-tree-walker'
import {
  ConnectedRouter,
  Provider,
  configureStore,
  createWhen,
  replace,
} from '@rispa/redux'
import getRoutes from '@rispa/routes'
import config from '@rispa/config'
import { CookiesProvider } from 'react-cookie'
import { flushWebpackRequireWeakIds } from 'react-loadable'
import Html from './Html'

const STATS_PATH = path.resolve(config.outputPath, './stats.json')
const SRR_PROFILE_PATH = path.resolve(config.outputPath, './ssr-profile.json')
let stats

const renderAndProfile = App => {
  for (let i = 0; i < 10; i += 1) {
    ReactDOM.renderToString(App)
  }

  SSRCaching.clearProfileData()
  SSRCaching.enableProfiling()
  const content = ReactDOM.renderToString(App)
  SSRCaching.enableProfiling(false)

  fs.writeFileSync(
    SRR_PROFILE_PATH,
    JSON.stringify(SSRCaching.profileData, null, 2)
  )

  return content
}

const createRender = (assets, cacheConfig) => (req, res) => {
  if (!stats) {
    stats = JSON.parse(String(fs.readFileSync(STATS_PATH)))
  }

  if (process.env.NODE_ENV === 'production') {
    SSRCaching.enableCaching()
    SSRCaching.setCachingConfig(cacheConfig)
  }

  const location = req.originalUrl
  const cookies = req.universalCookies
  const history = createHistory()
  const store = configureStore(history)
  const when = createWhen(store)
  const routes = getRoutes({ store, when, cookies })

  store.dispatch(replace(location))

  const App = (
    <Provider store={store}>
      <CookiesProvider cookies={cookies}>
        <ConnectedRouter history={history}>
          {routes}
        </ConnectedRouter>
      </CookiesProvider>
    </Provider>
  )

  reactTreeWalker(App, when.loadOnServer)
    .then(() => {
      const { router } = store.getState()
      const newLocation = `${router.location.pathname}${router.location.search}`
      if (newLocation !== location) {
        res.redirect(302, newLocation)
        return
      }

      const content = process.env.PROFILE_SSR
        ? renderAndProfile(App)
        : ReactDOM.renderToString(App)

      const rootDir = path.resolve(process.cwd())
      const paths = flushWebpackRequireWeakIds().map(
        p => path.relative(rootDir, p).replace(/\\/g, '/')
      )
      const flushedAssets = flushChunks(paths, stats, {
        rootDir,
      })
      assets.javascript = flushedAssets.scripts.reduce((newScripts, script) => {
        const key = script.replace(/\.js$/, '')
        newScripts[key] = `${config.publicPath.replace(/\/$/, '')}/${script}`
        return newScripts
      }, {})

      const html =
        `<!doctype html>\n${
        ReactDOM.renderToStaticMarkup(
          <Html
            assets={assets}
            content={content}
            initialState={JSON.stringify(store.getState())}
          />
        )}`

      res.send(html)
    })
}

export default createRender

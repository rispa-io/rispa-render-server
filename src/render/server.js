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
  replace,
  configureStore,
  createWhen,
} from '@rispa/redux'
import getRoutes from '@rispa/routes'
import config from '@rispa/config'
import { CookiesProvider } from '@rispa/vendor/cookies'
import { flushWebpackRequireWeakIds } from '@rispa/vendor/loadable'
import Html from './Html'

const STATS_PATH = path.resolve(__dirname, '../../../build/stats.json')
const SRR_PROFILE_PATH = path.resolve(__dirname, './ssr-profile.json')
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
  const history = createHistory()
  const store = configureStore(history)

  const when = createWhen(store)
  const routes = getRoutes(store, when)

  store.dispatch(replace(location))

  const App = (
    <Provider store={store}>
      <CookiesProvider cookies={req.universalCookies}>
        <ConnectedRouter history={history}>
          {routes}
        </ConnectedRouter>
      </CookiesProvider>
    </Provider>
  )
  reactTreeWalker(App, () => true)

  const { router } = store.getState()
  if (router.location.pathname !== location) {
    res.redirect(router.location.pathname, '302')
    return
  }

  when.loadOnServer().then(() => {
    const content = process.env.PROFILE_SSR
      ? renderAndProfile(App)
      : ReactDOM.renderToString(App)

    const rootDir = config.outputPath
    const paths = flushWebpackRequireWeakIds().map(
      p => path.relative(rootDir, p).replace(/\\/g, '/')
    )
    const flushedAssets = flushChunks(paths, stats, {
      rootDir,
      before: ['bootstrap'],
      after: ['main'],
    })

    assets.javascript = flushedAssets.scripts.reduce((newScripts, script) => {
      const key = script.replace(/\.js$/, '')
      newScripts[key] = script
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

import fs from 'fs'
import path from 'path'
import SSRCaching from 'electrode-react-ssr-caching'
import React from 'react'
import ReactDOM from 'react-dom/server'
import createHistory from 'history/createMemoryHistory'
import { parsePath } from 'history/PathUtils'
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
import { CookiesProvider } from 'react-cookie'
import { flushWebpackRequireWeakIds } from 'react-loadable'
import Html from './Html'

let stats

const renderAndProfile = (App, ssrProfilePath) => {
  for (let i = 0; i < 10; i += 1) {
    ReactDOM.renderToString(App)
  }

  SSRCaching.clearProfileData()
  SSRCaching.enableProfiling()
  const content = ReactDOM.renderToString(App)
  SSRCaching.enableProfiling(false)

  fs.writeFileSync(
    ssrProfilePath,
    JSON.stringify(SSRCaching.profileData, null, 2),
  )

  return content
}

const createRender = (assets, cacheConfig) => (req, res, config) => {
  const statsPath = path.resolve(config.outputPath, './stats.json')
  const ssrProfilePath = path.resolve(config.outputPath, './ssr-profile.json')

  if (!stats) {
    stats = JSON.parse(String(fs.readFileSync(statsPath)))
  }

  if (process.env.NODE_ENV === 'production') {
    SSRCaching.enableCaching()
    SSRCaching.setCachingConfig(cacheConfig)
  }

  const location = parsePath(req.url)
  const cookies = req.universalCookies
  const history = createHistory({
    initialEntries: [location],
    initialIndex: 0,
  })
  const initialState = {
    router: {
      location,
    }
  }
  const store = configureStore({ history, data: initialState, ssr: true })
  const when = createWhen({ store, ssr: true })
  const routes = getRoutes({ store, when, cookies })

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
      if (newLocation !== req.url) {
        res.redirect(302, newLocation)
        return
      }

      const content = process.env.PROFILE_SSR
        ? renderAndProfile(App, ssrProfilePath)
        : ReactDOM.renderToString(App)

      const rootDir = path.resolve(process.cwd())
      const paths = flushWebpackRequireWeakIds()

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
            />,
          )}`

      res.send(html)
    })
}

export default createRender

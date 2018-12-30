import React from 'react'
import { renderToString } from 'react-dom/server'
import { createMemoryHistory as createHistory, parsePath } from 'history'
import reactTreeWalker from 'react-tree-walker'
import {
  ConnectedRouter,
  Provider,
  configureStore,
  createWhen,
} from '@rispa/redux'
import getRoutes from '@rispa/routes'
import ServerPluginApi from '@rispa/server'
import { CookiesProvider } from 'react-cookie'
import Loadable from 'react-loadable'

import Response from '../response'

const { Redirect } = ServerPluginApi.errors

export default function render({ originalUrl: url, universalCookies: cookies }) {
  const location = parsePath(url)
  const history = createHistory({
    initialEntries: [location],
    initialIndex: 0,
  })
  const initialState = {
    router: {
      location,
    },
  }
  const store = configureStore({ history, data: initialState, ssr: true })
  const when = createWhen({ store, ssr: true })
  const routes = getRoutes({ store, when, cookies })

  const modules = []
  const handleReportModule = moduleName => modules.push(moduleName)

  const App = (
    <Loadable.Capture report={handleReportModule}>
      <Provider store={store}>
        <CookiesProvider cookies={cookies}>
          <ConnectedRouter history={history}>
            {routes}
          </ConnectedRouter>
        </CookiesProvider>
      </Provider>
    </Loadable.Capture>
  )

  return reactTreeWalker(App, when.loadOnServer)
    .then(() => {
      const state = store.getState()
      const newLocation = `${state.router.location.pathname}${state.router.location.search}`
      if (newLocation !== url) {
        throw new Redirect(newLocation)
      }

      console.log(modules)

      const content = renderToString(App)
      const statusCode = Response.peek() || 200

      Response.rewind()

      return {
        content,
        state,
        statusCode,
      }
    })
}

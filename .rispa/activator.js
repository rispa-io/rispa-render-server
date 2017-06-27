import { init, prepare, build } from '@rispa/core/events'
import { server } from '@rispa/server/events'
import { createConfig } from '@webpack-blocks/webpack2'
import universalSettings from '../universal-webpack-settings'
import webpackConfigCommon from './common.wpc'
import webpackConfigClient from './client.wpc'
import getBabelOptions from './babel-options'
import clientConfiguration from '../src/configuration/client'
import renderMiddleware from '../src/middleware'

const activator = on => {
  on(init(server), registry => {
    registry.add('webpack.common', webpackConfigCommon)
    registry.add('webpack.client', webpackConfigCommon, webpackConfigClient)
    registry.add('babel', getBabelOptions)
    registry.set('render', renderMiddleware)
  })

  on(init(build), registry => {
    registry.add('webpack.common', webpackConfigCommon)
    registry.add('webpack.client', webpackConfigCommon, webpackConfigClient)
    registry.add('babel', getBabelOptions)
  })

  const prepareHandler = registry => {
    const webpackConfig = createConfig(registry.get('webpack.client') || [])
    registry.set('webpack.client', [() => clientConfiguration(
      webpackConfig,
      universalSettings,
    )])
  }
  on(prepare(server), prepareHandler)
  on(prepare(build), prepareHandler)
}

export default activator

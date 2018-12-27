const path = require('path')
const { group, entryPoint, defineConstants } = require('@webpack-blocks/webpack')

module.exports = group([
  entryPoint(path.resolve(__dirname, '../../lib/server.js')),
  defineConstants({
    'process.env.SSR': true,
  }),
])

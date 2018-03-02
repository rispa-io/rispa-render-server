const { group, defineConstants } = require('@webpack-blocks/webpack2')

module.exports = group([
  defineConstants({
    'process.env.SSR': true,
  }),
])

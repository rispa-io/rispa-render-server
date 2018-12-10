const { group, defineConstants } = require('@webpack-blocks/webpack')

module.exports = group([
  defineConstants({
    'process.env.SSR': true,
  }),
])

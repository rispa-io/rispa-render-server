const WriteFilePlugin = require('write-file-webpack-plugin')
const StatsPlugin = require('stats-webpack-plugin')
const { group, env, defineConstants } = require('@webpack-blocks/webpack')

module.exports = group([
  (context, { merge }) => merge({
    plugins: [
      new StatsPlugin('stats.json', {
        chunkModules: true,
        modules: true,
        chunks: true,
        assets: true,
        chunkOrigins: true,
        source: false,
        exclude: [/node_modules/],
      }),
    ],
  }),
  defineConstants({
    'process.env.SSR': false,
  }),
  env('development', [
    (context, { merge }) => merge({
      plugins: [
        new WriteFilePlugin({
          test: /stats.json/,
        }),
      ],
    }),
  ]),
])

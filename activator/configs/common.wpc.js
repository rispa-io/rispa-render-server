module.exports = (context, { merge }) => merge({
  entry: {
    vendor: [
      require.resolve('react-cookie'),
    ],
  },
  resolve: {
    alias: {
      'react-loadable$': require.resolve('react-loadable'),
      'react-cookie$': require.resolve('react-cookie'),
    },
  },
})

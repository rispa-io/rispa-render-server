export default () => ({
  resolve: {
    alias: {
      'react-loadable$': require.resolve('react-loadable'),
      'react-cookie$': require.resolve('react-cookie'),
    },
  },
})

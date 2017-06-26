export default () => ({
  plugins: [
    [
      require.resolve('react-loadable/babel'),
      { server: false, webpack: true },
    ],
  ],
})

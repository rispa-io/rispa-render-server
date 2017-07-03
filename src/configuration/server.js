import relative from 'require-relative'
import { serverConfiguration } from 'universal-webpack'

const resolveModule = (context, request) => {
  let requestResolved
  try {
    requestResolved = relative.resolve(request, context)
  } catch (error) {
    requestResolved = null
  }
  return requestResolved
}

const isModuleExternal = module => (
  !/\\|\//.test(module) ||
  (/node_modules/.test(module) &&
    !/react-loadable|webpack-flush-chunks|react-cookie/.test(module)
  )
)

const externals = (context, request, callback) => {
  const requestResolved = resolveModule(context, request)
  if (requestResolved && isModuleExternal(requestResolved)) {
    return callback(null, requestResolved)
  }
  return callback()
}

export default (config, settings) => ({
  ...serverConfiguration(config, settings),
  externals,
  node: {
    __dirname: true,
  },
})

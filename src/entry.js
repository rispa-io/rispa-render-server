import createRenderServer from './render/server'
import createRenderClient from './render/client'

export default parameters => {
  const chunks = parameters.chunks()
  const cacheConfig = parameters.configuration.cacheConfig

  return {
    client: createRenderClient(chunks),
    server: createRenderServer(chunks, cacheConfig),
  }
}

import React, { PureComponent } from 'react'
import { objectOf, object, string } from 'prop-types'

const loadChunksOnClient = () => {
  const vendor = window.RISPA_VENDOR
  const chunks = window.RISPA_CHUNKS
  let loadedChunksCount = 0

  const loadScript = (src, handler) => {
    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.onload = handler
    document.body.appendChild(script)
  }

  const chunkLoadedHandler = () => {
    loadedChunksCount += 1
    if (loadedChunksCount === chunks.length) {
      window.startApp()
    }
  }

  const loadChunk = chunk => loadScript(chunk, chunkLoadedHandler)

  const vendorLoadedHandler = () => {
    if (chunks.length) {
      chunks.forEach(loadChunk)
    } else {
      window.startApp()
    }
  }

  loadScript(vendor, vendorLoadedHandler)
}

class InitialState extends PureComponent {
  static propTypes = {
    state: string.isRequired,
  }

  render() {
    return (
      <script
        dangerouslySetInnerHTML={{
          __html: `window.RISPA_INITIAL_STATE=${this.props.state};`,
        }}
        charSet='UTF-8'
      />
    )
  }
}

class Html extends PureComponent {
  static propTypes = {
    assets: objectOf(object),
    content: string,
    initialState: string,
  }

  render() {
    const { assets, content, initialState } = this.props

    let bootstrapScript
    let vendorScript
    const chunks = []
    Object.values(assets.javascript).forEach(script => {
      if (/bootstrap/.test(script)) {
        bootstrapScript = script
      } else if (/vendor/.test(script)) {
        vendorScript = script
      } else {
        chunks.push(script)
      }
    })

    return (
      <html lang='ru-RU'>
        <head>
          <link rel='shortcut icon' href='/favicon.ico' />
          <meta name='viewport' content='width=device-width, initial-scale=1' />
          {Object.keys(assets.styles).map(style => (
            <link
              href={assets.styles[style]}
              key={style}
              media='screen, projection'
              rel='stylesheet'
              type='text/css'
              charSet='UTF-8'
            />
          ))}
        </head>
        <body>
          <div id='root' dangerouslySetInnerHTML={{ __html: content || '' }} />
          {initialState && <InitialState state={initialState} />}
          <script src={bootstrapScript} charSet='UTF-8' />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.RISPA_VENDOR=${JSON.stringify(vendorScript)};
                window.RISPA_CHUNKS=${JSON.stringify(chunks)};
                (${loadChunksOnClient.toString()}());
              `,
            }}
            charSet='UTF-8'
          />
        </body>
      </html>
    )
  }
}

export default Html

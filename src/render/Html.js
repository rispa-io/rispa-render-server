import React, { PureComponent } from 'react'
import { objectOf, object, string } from 'prop-types'

const loadChunksOnClient = () => {
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
      // Schedule application start for next tick for break long frames
      setTimeout(window.startApp, 0)
    }
  }

  const loadChunk = chunk => loadScript(chunk, chunkLoadedHandler)

  if (chunks.length) {
    chunks.forEach(loadChunk)
  } else {
    setTimeout(window.startApp, 0)
  }
}

class InitialState extends PureComponent {
  static propTypes = {
    state: string,
  }

  render() {
    return this.props.state ? (
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // <![CDATA[
            window.RISPA_INITIAL_STATE=${this.props.state};
            // ]]>
          `,
        }}
        charSet='UTF-8'
      />
    ) : null
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
    const chunks = []
    Object.values(assets.javascript).forEach(script => {
      if (/bootstrap/.test(script)) {
        bootstrapScript = script
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
          <script src={bootstrapScript} charSet='UTF-8' />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // <![CDATA[
                window.RISPA_CHUNKS=${JSON.stringify(chunks)};
                (${loadChunksOnClient.toString()}());
                // ]]>
              `,
            }}
            charSet='UTF-8'
          />
          <InitialState state={initialState} />
        </body>
      </html>
    )
  }
}

export default Html

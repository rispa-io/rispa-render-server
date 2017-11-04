import React from 'react'
import ReactDOM from 'react-dom/server'
import Html from './Html'

const createRender = assets => (req, res) => {
  const html =
    `<!doctype html>\n${
    ReactDOM.renderToStaticMarkup(
      <Html assets={assets} />
    )}`

  res.send(html)
}

export default createRender

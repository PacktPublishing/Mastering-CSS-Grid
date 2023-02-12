const postcss = require('postcss')
const getPageStyles = require('./getPageStyles.js')
const replacePageStyles = require('./replacePageStyles.js')
const plugin = require('./plugin.js')

;(async () => {
  const pageCss = await getPageStyles()
  // console.log(pageCss)

  const processed = postcss([plugin]).process(pageCss, { from: undefined })

  replacePageStyles(processed.css)
})()

const postcss = require('postcss')
const getPageStyles = require('./getPageStyles.js')
const replacePageStyles = require('./replacePageStyles.js')
const nthcolNthrowPolyfill = require('./postcss-nthcol-nthrow.js')

;(async () => {
  const pageCss = await getPageStyles()

  const processed = postcss([nthcolNthrowPolyfill]).process(pageCss, { from: undefined })

  replacePageStyles(processed.css)
})()

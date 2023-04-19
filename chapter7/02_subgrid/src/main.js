const postcss = require('postcss')
const getPageStyles = require('./getPageStyles.js')
const replacePageStyles = require('./replacePageStyles.js')
const subgridPolyfill = require('./postcss-subgrid.js')

;(async () => {
  const pageCss = await getPageStyles()
  // console.log(pageCss)

  const processed = postcss([subgridPolyfill]).process(pageCss, { from: undefined })

  replacePageStyles(processed.css)
})()

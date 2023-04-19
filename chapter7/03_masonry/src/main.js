const postcss = require('postcss')
const getPageStyles = require('./getPageStyles.js')
const replacePageStyles = require('./replacePageStyles.js')
const masonryPolyfill = require('./postcss-masonry.js')

;(async () => {
  const pageCss = await getPageStyles()
  // console.log(pageCss)

  const processed = postcss([masonryPolyfill]).process(pageCss, { from: undefined })

  replacePageStyles(processed.css)
})()

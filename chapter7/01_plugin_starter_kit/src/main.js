const postcss = require('postcss')
const getPageStyles = require('./getPageStyles.js')
const replacePageStyles = require('./replacePageStyles.js')
const myPlugin = require('./postcss-myplugin.js')

;(async () => {
    const pageCss = await getPageStyles()

    const processed = postcss([myPlugin]).process(pageCss, { from: undefined })

    replacePageStyles(processed.css)
})()

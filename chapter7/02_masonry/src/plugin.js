const plugin = () => ({
  postcssPlugin: 'subgrid',
  prepare() {
    const determinePosition = (el, rowGap, columnGap, gridTemplateRows, gridTemplateColumns) => {
      let offsetLeft = el.offsetLeft - el.parentNode.offsetLeft
      let offsetTop = el.offsetTop - el.parentNode.offsetTop

      let elWidth = el.clientWidth
      let elHeight = el.clientHeight

      const rowGapInt = parseInt(rowGap)
      const colGapInt = parseInt(columnGap)

      // Float and rounding to deal with half-pixels
      const rowDefinitions = gridTemplateRows.split(' ').map(r => Math.round(parseFloat(r)))
      const colDefinitions = gridTemplateColumns.split(' ').map(c => Math.round(parseFloat(c)))

      let currentRow = 0
      while (offsetTop > 0) {
        offsetTop -= rowGapInt
        offsetTop -= rowDefinitions[currentRow]

        currentRow++
      }

      let height = 0
      while (elHeight > 0) {
        elHeight -= rowGapInt
        elHeight -= rowDefinitions[currentRow + height]

        height++
      }

      let currentCol = 0
      while (offsetLeft > 0) {
        offsetLeft -= colGapInt
        offsetLeft -= colDefinitions[currentCol]

        currentCol++
      }

      let width = 0
      while (elWidth > 0) {
        elWidth -= colGapInt
        elWidth -= colDefinitions[currentCol + width]

        width++
      }

      return {
        row: currentRow,
        col: currentCol,
        width: width,
        height: height,
      }
    }

    const masonrySelectors = []

    return {
      Rule (rule) {
        if (
          rule.nodes.some(n => n.prop === 'display' && n.value === 'grid')
          && rule.nodes.some(n => n.prop === 'grid-template-rows' && n.value === 'masonry')
        ) {
          masonrySelectors.push(rule.selector)
        }
      },

      OnceExit() {
        // If the browser actually supports it, don't attach.
        if (CSS.supports('grid-template-rows: subgrid') || CSS.supports('grid-template-columns: subgrid')) {
          return
        }

        window.addEventListener('load', () => {
          console.log('loaded!', masonrySelectors)

          masonrySelectors.forEach(selector => {
            Array.from(document.querySelectorAll(selector)).forEach(el => {
              el.style.gridTemplateRows = ''
              el.style.gridAutoRows = 'min-content'

              const { rowGap, gridTemplateColumns } = getComputedStyle(el)
              const numberOfColumns = gridTemplateColumns.split(' ').length
              const containerOffsetTop = parseInt(el.offsetTop)

              console.log(gridTemplateColumns, numberOfColumns)

              Array.from(el.children).forEach(el => el.style.display = 'none')
              Array.from(el.children).forEach(el => {
                el.style.display = 'block'
                el.setAttribute('data-height', getComputedStyle(el).height)
                el.style.display = 'none'
              })
              Array.from(el.children).forEach(el => el.style.display = 'inline')


              let i = 0;
              for (let i = numberOfColumns; i < el.children.length; i++) {
                const currentEl = el.children[i]
                const aboveEl = el.children[i - numberOfColumns]
                const aboveElOffsetTop = aboveEl.offsetTop

                const shiftUp = currentEl.offsetTop - aboveElOffsetTop - parseInt(aboveEl.getAttribute('data-height')) - parseInt(rowGap)

                currentEl.style.marginTop = `-${shiftUp}px`
              }

            })
          })
        })
      }
    }
  },
})

plugin.postcss = true

module.exports = plugin

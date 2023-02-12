const plugin = () => ({
  postcssPlugin: 'subgrid',
  prepare() {
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

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

    const subgridElements = []

    return {
      Rule (rule) {
        if (rule.nodes.some(n => n.prop === 'display' && n.value === 'grid')) {
          // We've got a candidate

          const hasRowsSubgrid = rule.nodes.some(n => n.prop === 'grid-template-rows' && n.value === 'subgrid')
          const hasColsSubgrid = rule.nodes.some(n => n.prop === 'grid-template-columns' && n.value === 'subgrid')

          if (hasRowsSubgrid || hasColsSubgrid) {
            subgridElements.push({
              selector: rule.selector,
              hasRowsSubgrid,
              hasColsSubgrid
            })
          }
        }
      },

      OnceExit() {
        // If the browser actually supports it, don't attach.
        if (CSS.supports('grid-template-rows: subgrid') || CSS.supports('grid-template-columns: subgrid')) {
          return
        }

        subgridElements.forEach(subgridEl => {
          [...document.querySelectorAll(subgridEl.selector)].forEach(domEl => {
            const { rowGap, columnGap, gridTemplateRows, gridTemplateColumns } = getComputedStyle(domEl.parentNode)
            const { row, col, width, height } = determinePosition(domEl, rowGap, columnGap, gridTemplateRows, gridTemplateColumns)

            const gridRows = gridTemplateRows.split(' ')
            const gridCols = gridTemplateColumns.split(' ')

            let style = ''

            if (subgridEl.hasRowsSubgrid) {
              style += `
                row-gap: ${rowGap};
                grid-template-rows: ${gridRows.slice(row, row + height).join(' ')};
              `
            }

            if (subgridEl.hasColsSubgrid) {
              style += `
                column-gap: ${columnGap};
                grid-template-columns: ${gridCols.slice(col, col + width).join(' ')};
              `
            }

            domEl.setAttribute('style', style)
          })
        })
      }
    }
  },
})

plugin.postcss = true

module.exports = plugin

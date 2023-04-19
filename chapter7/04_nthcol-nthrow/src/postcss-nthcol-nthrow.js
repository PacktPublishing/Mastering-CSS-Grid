const slugify = require('slugify')
const { Equation, parse } = require('algebra.js')

const plugin = () => ({
  postcssPlugin: 'nth-row-col',
  prepare() {
    const classNameToRegularity = {
      row: {},
      col: {},
    }
    const potentialGridSelectors = []
    slugify.extend({'+': 'plus'})

    const handleSelector = (rule, kind) => {
      const matches = [...rule.selector.matchAll(new RegExp(`:nth-${kind}\\(([0-9a-z+\\- ]+)\\)`, 'g'))]

      matches.forEach(match => {
        // Replace :nth-col selector with class name
        let regularity = match[1]
        if (regularity === 'even') {
          regularity = '2n'
        }
        if (regularity === 'odd') {
          regularity = '2n + 1'
        }

        const replacementSelector = `.nth-${kind}-${slugify(regularity)}`
        rule.selector = rule.selector.replace(match[0], replacementSelector)

        // Store regularity and class name for future use
        if (!classNameToRegularity[kind][replacementSelector]) {
          classNameToRegularity[kind][replacementSelector] = new parse(regularity)
        }
      })
    }

    const determinePosition = el => {
      const { rowGap, columnGap, gridTemplateRows, gridTemplateColumns } = getComputedStyle(el.parentNode)

      let offsetLeft = el.offsetLeft - el.parentNode.offsetLeft
      let offsetTop = el.offsetTop - el.parentNode.offsetTop

      const rowGapInt = parseInt(rowGap)
      const colGapInt = parseInt(columnGap)
      const rowDefinitions = gridTemplateRows.split(' ').map(r => Math.round(parseFloat(r)))
      const colDefinitions = gridTemplateColumns.split(' ').map(c => Math.round(parseFloat(c)))

      let currentRow = 0
      while (offsetTop > 0) {
        offsetTop -= rowGapInt
        offsetTop -= rowDefinitions[currentRow]
        currentRow++
      }

      let currentCol = 0
      while (offsetLeft > 0) {
        offsetLeft -= colGapInt
        offsetLeft -= colDefinitions[currentCol]
        currentCol++
      }

      // Add 1 to have one-indexed rows and cols
      return {
        row: currentRow + 1,
        col: currentCol + 1,
      }
    }

    return {
      Rule (rule) {
        if (rule.selector.includes(':nth-col')) {
          handleSelector(rule, 'col')
        }

        if (rule.selector.includes(':nth-row')) {
          handleSelector(rule, 'row')
        }

        // If the rule is display:grid, the selector of it is a candidate whose
        // child elements may be targeted by a nth-col() selector.
        if (rule.nodes.some(n => n.prop === 'display' && n.value === 'grid')) {
          potentialGridSelectors.push(rule.selector)
        }
      },
      OnceExit() {
        potentialGridSelectors.forEach(selector => {
          [...document.querySelectorAll(selector)]
            .filter(el => getComputedStyle(el).display === 'grid')
            .forEach(el => {
              [...el.children].forEach(child => {
                const { row, col } = determinePosition(child)

                child.setAttribute('data-row', row)
                child.setAttribute('data-col', col)

                for ([className, regularity] of Object.entries(classNameToRegularity['row'])) {
                  const eq = new Equation(regularity, row)

                  // Here, we deal with equations like 2n+1 = 3 (2n+1 being the odd numbers)
                  // By solving for n, with n being an element of the integers, we can figure out if the
                  // result (3) satisfies the expression 2n+1. Solving for n: 2n+1 = 3 => 2n = 2 => n = 1.
                  // Since the result is a whole number, it satisfies the rule. However: 2n+1 = 4 =>
                  // 2n = 3 => n = 1.5, which is not a whole number, so not satisfied.
                  if (eq.solveFor('n').denom === 1) {
                    child.classList.add(className.replace('.', ''))
                  }
                }

                for ([className, regularity] of Object.entries(classNameToRegularity['col'])) {
                  const eq = new Equation(regularity, col)

                  if (eq.solveFor('n').denom === 1) {
                    child.classList.add(className.replace('.', ''))
                  }
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

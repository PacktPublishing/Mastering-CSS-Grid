import './node_modules/animate-css-grid/dist/main.js'

const grid = document.querySelector('.grid-container')
animateCSSGrid.wrapGrid(grid)

;[...document.querySelectorAll('input')].forEach(el => {
  el.addEventListener('change', e => {
    const targetDiv = e.target.closest('div.grid-element')

    if (e.target.checked) {
      targetDiv.classList.add(e.target.value)
    } else {
      targetDiv.classList.remove(e.target.value)
    }
  })
})

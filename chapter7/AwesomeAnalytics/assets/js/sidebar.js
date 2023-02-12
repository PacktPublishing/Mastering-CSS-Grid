document.querySelector('#sidebar-toggle').addEventListener('click', (e) => {
  e.preventDefault()

  document.querySelector('.sidebar').classList.toggle('collapsed')
})

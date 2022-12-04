import { faker } from '../../node_modules/@faker-js/faker/dist/esm/index.mjs'
import shade from '../../node_modules/lighten-darken-color/component/colorshade.js'
import { Chart, registerables } from '../../node_modules/chart.js/dist/chart.esm.js'

Chart.register(...registerables)

const colors = [
  '#a1dab4',
  '#41b6c4',
  '#2c7fb8',
  '#253494',
  '#fbb4b9',
  '#f768a1',
  '#c51b8a',
  '#7a0177',
  '#fecc5c',
  '#fd8d3c',
  '#f03b20',
  '#bd0026',
]

const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1)

const hexToRGBA = (hex, alpha = 1.0) => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)

  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const generateBarChartData = (title) => {
  const numberOfSamples = faker.datatype.number({ min: 3, max: 12 })

  const labels = []
  const backgroundColors = []
  const borderColors = []
  const data = []

  for (let i = 0; i < numberOfSamples; i++) {
    labels.push(capitalize(faker.word.noun()))
    backgroundColors.push(colors[i])
    borderColors.push(shade(colors[i], 20))
    data.push(faker.datatype.number({ min: 1, max: 100 }))
  }

  return {
    labels: labels,
    datasets: [{
      label: title,
      data: data,
      backgroundColor: backgroundColors,
      borderColor: borderColors,
      borderWidth: 1
    }]
  }
}

const generateBubbleChartData = (title) => {
  const numberOfSamples = faker.datatype.number({ min: 5, max: 25 })

  const maxX = faker.datatype.number({ min: 10, max: 200 })
  const maxY = faker.datatype.number({ min: 10, max: 200 })

  const label = title
  const data = []
  for (let i = 0; i < numberOfSamples; i++) {
    data.push({
      x: faker.datatype.number({ min: 0, max: maxX }),
      y: faker.datatype.number({ min: 0, max: maxY }),
      r: faker.datatype.number({ min: 1, max: 20 }),
    })
  }

  return {
    datasets: [{
      label,
      data,
      backgroundColor: faker.helpers.arrayElement(colors)
    }]
  }
}

const generateLineChartData = () => {
  const numberOfSamples = faker.datatype.number({ min: 5, max: 15 })
  const numberOfDataSets = faker.datatype.number({ min: 1, max: 3 })

  const labels = []
  const datasets = []

  for (let d = 0; d < numberOfDataSets; d++) {
    const data = []
    const label = capitalize(faker.word.adjective() + ' ' + faker.word.noun())
    const color = faker.helpers.arrayElement(colors)

    for (let i = 0; i < numberOfSamples; i++) {
      data.push(faker.datatype.number({ min: -50, max: 50 }))
    }

    datasets.push({
      label,
      data,
      fill: false,
      borderColor: color,
      tension: 0.1
    })
  }

  for (let i = 0; i < numberOfSamples; i++) {
    labels.push(capitalize(faker.word.noun()))
  }

  return {
    labels,
    datasets
  }
}

const generateRadarChartData = () => {
  const numberOfSamples = faker.datatype.number({ min: 5, max: 12 })
  const numberOfDataSets = faker.datatype.number({ min: 1, max: 3 })

  const labels = []
  const datasets = []

  for (let d = 0; d < numberOfDataSets; d++) {
    const data = []
    const label = capitalize(faker.word.adjective() + ' ' + faker.word.noun())
    const color = faker.helpers.arrayElement(colors)

    for (let i = 0; i < numberOfSamples; i++) {
      data.push(faker.datatype.number({ min: 0, max: 50 }))
    }

    datasets.push({
      label,
      data,
      fill: true,
      borderColor: shade(color, 20),
      backgroundColor: hexToRGBA(color, 0.3),
      opacity: 0.5,
    })
  }

  for (let i = 0; i < numberOfSamples; i++) {
    labels.push(capitalize(faker.word.noun()))
  }

  return {
    labels,
    datasets
  }
}

document.querySelectorAll('.chart-box').forEach(e => {
  const type = faker.helpers.arrayElement(['bar', 'bubble', 'pie', 'line', 'radar'])

  let title = ''
  let data = {}
  let scales = {
    y: {
      beginAtZero: true,
    },
    x: {
      beginAtZero: true,
    }
  }
  switch (type) {
    case 'bar':
    case 'pie':
      title = `Amount of ${faker.word.adjective()} ${faker.word.noun()}`
      data = generateBarChartData(title)
      break
    case 'bubble':
      title = `Distribution of ${faker.word.adjective()} ${faker.word.noun()}`
      data = generateBubbleChartData(title)
      break
    case 'line':
      title = faker.word.adjective() + ' ' + faker.word.noun() + ' per ' + faker.word.adjective() + ' ' + faker.word.noun() + ' (in ' + faker.science.unit().name + ')'
      data = generateLineChartData()
      break
    case 'radar':
      title = `Distribution of ${faker.word.adjective()} ${faker.word.noun()}`
      data = generateRadarChartData()
      break

  }

  if (type === 'pie' ||type === 'radar') {
    scales = false
  }

  e.querySelector('header h2').innerHTML = title

  const config = {
    type,
    data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales
    },
  }

  const canvas = e.querySelector('canvas')
  const myChart = new Chart(
    canvas,
    config
  )
})

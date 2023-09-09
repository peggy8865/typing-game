const ctx = document.getElementById('activity-degree')

// eslint-disable-next-line no-new
new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['a', 'b', 'c', 'd', 'e', 'f'],
    datasets: [{
      label: '打字次數',
      data: [2, 9, 3, 5, 2, 3],
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0
    }]
  }
})

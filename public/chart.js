const ctx = document.getElementById('activity-degree')
const yAxisNodes = document.querySelectorAll('.y-axis-num')
const yAxisNums = Array.from(yAxisNodes, yAxisNode => Number(yAxisNode.textContent))
const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
const currentMonth = new Date(Date.now()).getMonth() + 1
const X_AXIS_LENGTH = 6

// eslint-disable-next-line no-new
new Chart(ctx, {
  type: 'line',
  data: {
    labels: months.slice(currentMonth - X_AXIS_LENGTH, currentMonth),
    datasets: [{
      label: '打字次數',
      data: yAxisNums.slice(currentMonth - X_AXIS_LENGTH, currentMonth),
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0
    }]
  }
})

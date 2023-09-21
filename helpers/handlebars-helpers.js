const dayjs = require('dayjs')
module.exports = {
  currentYear: () => dayjs().year(),
  plusOne: x => x + 1
}

const express = require('express')
const exphbs = require('express-handlebars')
const app = express()
const PORT = 3000
const db = require('./models')
const router = require('./routes')

app.engine('.hbs', exphbs({ defaultLayout: 'main', extname: '.hbs' }))
app.set('view engine', '.hbs')

app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(router)

app.listen(PORT, () => {
  console.log(`App is running on http://localhost:${PORT}`)
})

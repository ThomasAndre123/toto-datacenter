require('dotenv').config()

const express = require('express')
const app = express()
const port = process.env.PORT || 3000

const { Sequelize } = require('sequelize')

const sequelize = new Sequelize(process.env.DB_URL, {	
	logging: process.env.NODE_ENV === 'production' ? false : console.log,	
})

app.use(express.urlencoded({
    extended: false,
    verify: (req, res, buff, encoding) => {
        req.rawBody = buff;
    },
    limit: '1mb',
}));

app.use(express.json({
    limit: '1mb',
}));


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/result', (req, res) => {
    const { source, marketName, marketCode, websiteUrl, closeTime, resultTime, result } = req.body
    console.log(
        source, marketName, marketCode, websiteUrl, closeTime, resultTime, result
    )
    res.json({ code:0, message: 'OK'})
})

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
var express = require('express')
var morgan = require('morgan')
var bodyParser = require('body-parser')
var cors = require('cors')
var api = require('./api')

var PORT = process.env.PORT || 8080
var app = express()

app.use(morgan('dev'))
app.use(cors({credentials: true, origin: true}))
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use('/api/v1', api.v1)
app.use('/api/v2', api.v2)

app.listen(PORT)

console.log(`Running on http://localhost:${PORT}`)

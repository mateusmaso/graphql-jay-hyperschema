var fs = require('fs')
var path = require('path')
var express = require('express')
var store = require('../../store')

var router = express.Router()

router.get('/users/:id', (request, response) => {
  response.json(store.user)
})

module.exports = router

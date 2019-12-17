const express = require('express')
const sqlite3 = require("sqlite3").verbose()
const cors = require('cors')
const _ = require('lodash')
const app = express()
const file = "./main.db";
const db = new sqlite3.Database(file)

app.use(express.json())
app.use(cors())

app.get('/api/get/post/:arr', function (req, res) {
  let arr = JSON.parse(req.params.arr)
  let op = ""
  for (let i = 0; i < arr.length; i++) {
    op += ` id = ${parseInt(arr[i])} `
    if (i != arr.length-1) {
      op += "OR"
    }
  }
  db.all(`select * from post where ${op} order by timestamp;`, (err, data) => {
    res.send(JSON.stringify(data))
  })
})

app.get('/api/get/comments/:n', function (req, res) {
  db.all(`select * from comments where article = ${req.params.n} order by id;`, (err, data) => {
    res.send(JSON.stringify(data))
  })
})

app.get('/api/search/:text/:s/:e', function (req, res) {
  let text = req.params.text
  let result = []
  let op = ""
  let s = req.params.s
  let e = req.params.e
  if (e != -1 && s != -1) {
    op = `AND timestamp < ${e} AND timestamp > ${s}`
  }
  db.all(`SELECT article FROM comments WHERE text LIKE "%${text}%" ${op} group by article;`, (err, data) => {
    _.forEach(data, (o) => {
      result.push(o.article)
    })
    res.send(JSON.stringify(result))
  })
})

app.get('/api/search/:s/:e', function (req, res) {
  let result = []
  let op = ""
  let s = req.params.s
  let e = req.params.e
  if (e != -1 && s != -1) {
    op = `AND timestamp <= ${e} AND timestamp >= ${s}`
  }
  console.log(op)
  db.all(`SELECT article FROM comments WHERE ${op} group by article;`, (err, data) => {
    _.forEach(data, (o) => {
      result.push(o.article)
    })
    res.send(JSON.stringify(result))
  })
})

app.get('/api/get/count', function (req, res) {
  db.all(`select id from post;`, (err, data) => {
    let result = []
    _.forEach(data, (o) => {
      result.push(o.id)
    })
    res.send(JSON.stringify(result))
  })
})

app.get('/api/get/count/tag/:text', function (req, res) {
  db.all(`select count(tag) from comments where tag like "%${req.params.text}%";`, (err, data) => {
    let result = JSON.stringify(data)
    result = (result.split(":")[1]).split("}")[0]
    res.send(result)
  })
})


port = process.env.PORT
//port = 8081
app.listen(port, () => console.log(`Listening on http://localhost:${port}/`))

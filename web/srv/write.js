const fs = require('fs')
const _ = require('lodash')
const db = require('better-sqlite3')('data.db')

let total = 0

fs.readFile('../../data/Gossiping015.json', (err,data) => {
  data = JSON.parse(data)
  insertPost(data)
  let all = []
  _.forEach(data, (o) => {
    _.forEach(o.comment_data, (comment) => {
      comment["link"] = o.article_link
      comment["date"] = (new Date(o.date)).getTime()
      all.push(comment)
    })
  })
  total = all.length
  insertComment(all)
})


const inpost = db.prepare("INSERT INTO post(title, link, board, author, content, timestamp) VALUES (@article_title,@article_link,@board,@author,@content,@date);")
const insertPost = db.transaction((o) => {
  o.date = (new Date(o.date)).getTime()
  for (const i of o) {
    inpost.run(i)
    console.log(i.article_title)
  }
})

const incomme = (link) => db.prepare(`INSERT INTO comments(tag, article, user, text, ip, timestamp) VALUES (@tag,(SELECT id FROM post WHERE link LIKE '%${link}%'),@user_id,@text,@ip,@date);`)
const insertComment = db.transaction((o) => {
  for (const i of o) {
    console.log(total--)
    !(incomme(i.link)).run(i)
  }
})

<template>
<v-container>
  <v-row no-gutters>

    <v-col xs="12" md="4" class="px-5">
      <v-card class="pa-5 my-5 text-left">
        <p class="title">過濾條件</p>
        <v-text-field v-model="searchText"></v-text-field>
        <p class="text-left">選項</p>
        <v-radio-group v-model="searchOpinion" row class="pb-3">
          <v-radio label="留言" value="comments"></v-radio>
          <v-radio label="使用者" value="user"></v-radio>
          <v-radio label="文章" value="posts"></v-radio>
        </v-radio-group>
        <p class="text-left">日期</p>
        <v-menu v-model="smenu" :close-on-content-click="false" :nudge-right="80" transition="scale-transition" offset-y>
          <template v-slot:activator="{ on }">
            <v-text-field v-model="sdate" label="開始日期" prepend-icon="mdi-calendar-clock" readonly v-on="on"></v-text-field>
          </template>
          <v-date-picker v-model="sdate" @input="smenu = false"></v-date-picker>
        </v-menu>
        <v-menu v-model="emenu" :close-on-content-click="false" :nudge-right="80" transition="scale-transition" offset-y>
          <template v-slot:activator="{ on }">
            <v-text-field v-model="edate" label="結束日期" prepend-icon="mdi-calendar-clock" readonly v-on="on"></v-text-field>
          </template>
          <v-date-picker v-model="edate" @input="emenu = false"></v-date-picker>
        </v-menu>
        <br>
        <v-divider></v-divider>
        <br>
        <div class="d-flex flex-row">
          <v-spacer></v-spacer>
          <v-btn @click="cleanFilter" width="80px" class="mx-5">清除條件</v-btn>
          <v-btn @click="search" color="primary" width="80px">搜尋</v-btn>
        </div>
      </v-card>
      <v-card class="pa-5 my-5 text-left">
        <p class="title">統計資料</p>
        <p class="subtitle-1">資料數： {{total.length}}</p>
        <ve-pie :data="upDownPieData" :colors="upDownPieData.colors"></ve-pie>
        <br>
        <div v-if="searchLineData.rows.length!=0">
          <p class="subtitle-1">關鍵字： {{searchText}}</p>
          <ve-line :data="searchLineData"></ve-line>
        </div>
      </v-card>
    </v-col>

    <v-col xs="12" md="8" class="py-5">
      <div v-if="show.length==0">
        <v-progress-circular :size="80" :width="3" class="ma-5 pa-5" color="primary" indeterminate></v-progress-circular>
      </div>
      <div v-for="item in show" :key="item.id">
        <v-card class="mx-auto text-left" width="100%">
          <v-card-text>
            <div>{{ item.board }}</div>
            <p class="display-1 text--primary">{{ item.title }}</p>
            <p>{{ new Date(item.timestamp) }}</p>
            <p>{{ item.author }}</p>
            <div class="text--primary" v-html="item.content"></div>
          </v-card-text>
          <v-card-actions>
            <v-btn text color="deep-purple accent-4" @click="getcomments(item.id)">留言</v-btn>
            <v-btn text color="deep-purple accent-4" @click="go(item.link)">原文連結</v-btn>
          </v-card-actions>
          <div v-if="item.showComment">
            <div v-for="comment in item.comments" :key="comment.id">
              <v-card-subtitle class="py-0"><span v-html="comment.user"></span> ({{ comment.ip }})</v-card-subtitle>
              <v-card-text class="text--primary"><span :class="comment.color+'--text'">{{ comment.tag }}</span> <span v-html="comment.text"></span></v-card-text>
            </div>
          </div>
        </v-card>
        <br>
      </div>
      <div v-if="barlength > 1 && show.length!=0" class="pa-5 mb-5">
        <div class="text-center">
          <v-pagination v-model="page" @input="render()" :length="barlength" :total-visible="11"></v-pagination>
        </div>
      </div>
    </v-col>
  </v-row>

</v-container>
</template>

<script>
import _ from 'lodash'
import * as axios from 'axios'
export default {
  name: 'Page',
  data: () => ({
    searchText: '',
    show: [],
    data: [],
    page: 1,
    total: [],
    max: 5,
    api: '',
    barlength: 1,
    sdate: null,
    edate: null,
    smenu: false,
    emenu: false,
    menu: false,
    showComment: false,
    searchOpinion: "comments",
    upDownPieData: {
      colors: ['#C5E1A5', '#F48FB1', '#03A9F4'],
      columns: ['tag', 'count'],
      rows: [{
          'tag': '推',
          'count': 0
        },
        {
          'tag': '噓',
          'count': 0
        },
        {
          'tag': '→',
          'count': 0
        }
      ]
    },
    searchLineData: {
      columns: ['date', 'count'],
      rows: []
    }
  }),
  beforeMount: function() {
    this.load()
  },
  methods: {
    load: function() {
      let self = this
      self.showComment = false
      if (process.env.NODE_ENV == 'development') {
        self.api = 'http://localhost:8081/api'
      } else {
        self.api = 'https://nehs.daan.nctu.me/api'
      }
      window.console.log(self.api)
      axios
        .get(`${self.api}/get/count`)
        .then(res => {
          self.total = res.data
        })
        .then(() => {
          self.page = 1
          self.render()
        })
      this.getCommentData()
    },
    getCommentData: function() {
      let self = this
      self.upDownPieData.rows.forEach((o) => {
        axios.get(`${self.api}/get/count/tag/${o.tag}`).then(res => {
          o.count = res.data
        })
      })
    },
    getcomments: function(id) {
      let self = this
      axios.get(`${self.api}/get/comments/${id}`).then(res => {
        self.show.forEach(o => {
          if (o.id == id) {
            o.comments = res.data
            o.showComment = !o.showComment
            o.comments.forEach((c) => {
              if (c.tag == "推") {
                c['color'] = "text--darken-2 indigo"
              } else if (c.tag == "噓") {
                c['color'] = "text--darken-2 red"
              }
              c.text = c.text.replace(new RegExp(self.searchText, "ig"), `<span class="light-green lighten-2">${self.searchText}</span>`)
              c.user = c.user.replace(new RegExp(self.searchText, "ig"), `<span class="light-green lighten-2">${self.searchText}</span>`)
            })
          }
        })
      })
    },
    go: function(link) {
      window.location = link
    },
    render: function() {
      let self = this
      let startindex = (self.page - 1) * self.max
      let endindex = startindex + self.max - 1
      while (self.total[endindex] == undefined) {
        endindex--
      }
      let arr = JSON.stringify(_.slice(self.total, startindex, endindex + 1))
      axios.get(`${self.api}/get/post/${arr}`).then(res => {
        res.data.forEach(o => {
          o['comments'] = []
          o['showComment'] = false
          if (self.showComment) {
            self.getcomments(o.id)
          }
          o.content = o.content.replace(/\n/g, '<br>')
        })
        self.show = res.data
        let offset = 0
        if (self.total.length % self.max != 0) {
          offset = 1
        }
        self.barlength = Math.floor(self.total.length / self.max) + offset
        if (self.barlength == 0) {
          self.barlength++
        }
      })
    },
    search: function() {
      let self = this
      self.show = []
      self.searchLineData.rows = []
      switch (self.searchOpinion) {
        case "user":
          self.showComment = true
          self.searchMethods("user")
          break
        case "comments":
          self.showComment = true
          self.searchMethods("comments")
          break
        case "posts":
          self.searchMethods("posts")
          break
        default:
          break
      }
    },
    searchMethods: function(methods) {
      let self = this
      let s = -1
      let e = -1
      if (self.sdate != null && self.edate != null) {
        s = new Date(self.sdate).getTime()
        e = new Date(self.edate).getTime()
        if (new Date(e).getTime() < new Date(s).getTime()) {
          return
        }
      }
      if (self.searchText == '') {
        self.cleanFilter()
        return
      }
      axios.get(`${self.api}/search/${methods}/${self.searchText}/${s}/${e}`).then(res => {
        if (res.data.length == 0) {
          self.load()
          return
        }
        self.total = []
        let dateCount = {}
        res.data.forEach(o => {
          if (o.article != null) {
            let date = new Date(o.timestamp)
            o.timestamp = `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}`
            if (dateCount[o.timestamp] != undefined) {
              dateCount[o.timestamp] += 1
            } else {
              dateCount[o.timestamp] = 1
            }
            if (self.total.indexOf(o.article) == -1) {
              self.total.push(o.article)
            }
          }
        })
        let data = []
        window.console.log(dateCount)
        Object.keys(dateCount).forEach(name => {
          if (!isNaN(dateCount[name])) {
            let tmp = new Date(name)
            let month = (tmp.getMonth() + 1)
            let date = tmp.getDate()
            let year = tmp.getFullYear()
            data.push({
              'date': `${year}.${month}/${date}`,
              'timestamp': tmp.getTime(),
              'count': dateCount[name]
            })
          }
        })
        self.searchLineData.rows = _.sortBy(data, [(o) => {
          let tmp = new Date(o.timestamp)
          let month = (tmp.getMonth() + 1)
          let date = tmp.getDate()
          let year = tmp.getFullYear()
          if (month < 10) month = `0${month}`
          if (date < 10) date = `0${date}`
          return parseInt(`${year}${month}${date}`)
        }])
        self.page = 1
        self.show = []
        self.render()
      })
    },
    cleanFilter: function() {
      let self = this
      self.sdate = null
      self.edate = null
      self.searchText = ""
      self.load()
      self.searchLineData.rows = []
    }
  }
}
</script>

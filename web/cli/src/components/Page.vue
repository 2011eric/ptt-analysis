<template>
<v-container>
  <v-row no-gutters>

    <v-col xs="12" md="4" class="px-5">
      <v-card class="pa-5 my-5 text-left">
        <p class="title">過濾條件</p>
        <v-text-field v-model="search"></v-text-field>
        <div class="d-inline-flex flex-column ma-3">
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
        </div>
        <div class="d-inline-flex flex-column ma-3">
        </div>
        <br>
        <v-divider></v-divider>
        <br>
        <div class="d-flex flex-row">
          <v-spacer></v-spacer>
          <v-btn @click="cleanFilter" width="80px" class="mx-5">清除條件</v-btn>
          <v-btn @click="searchPost" color="primary" width="80px">搜尋</v-btn>
        </div>
      </v-card>
      <v-card class="pa-5 my-5 text-left">
        <p class="title">統計資料</p>
        <p class="subtitle-1">資料數: {{total.length}}</p>
        <ve-pie :data="upDownPieData" :colors="upDownPieData.colors"></ve-pie>
        <br>
        <ve-line :data="searchLineData" v-if="searchLineData.rows.length!=0"></ve-line>
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
              <v-card-subtitle class="py-0">{{ comment.user }} ({{ comment.ip }})</v-card-subtitle>
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
    search: '',
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
    upDownPieData: {
      colors: ['#C5E1A5','#F48FB1','#03A9F4'],
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
    getCommentData: function () {
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
              c.text = c.text.replace(self.search, `<span class="light-green lighten-2">${self.search}</span>`)
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
    searchPost: function() {
      let self = this
      let s = -1
      let e = -1
      if (self.sdate != null && self.edate != null) {
        s = new Date(self.sdate).getTime()
        e = new Date(self.edate).getTime()
        window.console.log(s, e)
        if (new Date(e).getTime() < new Date(s).getTime()) {
          return
        }
      }
      if (self.search == '') {
        self.cleanFilter()
        return
      }
      let url = `${self.api}/search/${self.search}/${s}/${e}`
      axios.get(url).then(res => {
        if (res.data.length == 0) {
          self.load()
          return
        }
        self.total = []
        res.data.forEach(o => {
          let date = new Date(o.timestamp)
          o.timestamp = (date.getMonth()+1) + "/" + date.getDate()
          self.total.push(o.article)
        })
        let dateCount = _.countBy(res.data, 'timestamp')
        let data = []
        Object.keys(dateCount).forEach(name => {
          data.push({
            'date': name,
            'count': dateCount[name]
          })
        })
        self.searchLineData.rows = []
        self.searchLineData.rows = _.sortBy(data, [(o) => new Date(o.order).getTime()])
        //_.reverse(self.searchLineData.rows)
        self.page = 1
        self.show = []
        self.showComment = true
        self.render()
      })
    },
    cleanFilter: function() {
      this.sdate = null
      this.edate = null
      this.search = ""
      this.load()
    }
  }
}
</script>

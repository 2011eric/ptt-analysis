<template>
<v-container>

  <div class="d-flex justify-center mb-6 flex-column text-center">
    <v-text-field v-model="search" append-icon="mdi-magnify" @click:append="searchPost()"></v-text-field>
    <v-card class="d-flex flex-column pa-3 my-5" width="350px">
      <p class="text-left">過濾條件</p>
      <v-menu v-model="smenu" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px">
        <template v-slot:activator="{ on }">
          <v-text-field v-model="sdate" label="開始日期" prepend-icon="mdi-calendar-clock" readonly v-on="on"></v-text-field>
        </template>
        <v-date-picker v-model="sdate" @input="smenu = false"></v-date-picker>
      </v-menu>
      <v-menu v-model="emenu" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px">
        <template v-slot:activator="{ on }">
          <v-text-field v-model="edate" label="結束日期" prepend-icon="mdi-calendar-clock" readonly v-on="on"></v-text-field>
        </template>
        <v-date-picker v-model="edate" @input="emenu = false"></v-date-picker>
      </v-menu>
      <v-btn @click="cleanFilter" width="80px">清除條件</v-btn>
    </v-card>
    <div class="text-left indigo--text text--lighten-1">資料數: {{total.length}}<br><br></div>
    <div v-if="show.length==0">
      <br>
      <v-progress-circular :size="80" :width="3" class="ma-5 pa-5" color="primary" indeterminate></v-progress-circular>
    </div>
    <div v-for="item in show" :key="item.id">
      <v-card class="mx-auto text-left" max-width="90%">
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
            <v-card-text class="text--primary">{{ comment.text }}</v-card-text>
          </div>
        </div>
      </v-card>
      <br>
    </div>
  </div>
  <div v-if="barlength > 1 && show.length!=0" class="pa-5 mb-5">
    <div class="text-center">
      <v-pagination v-model="page" @input="render()" :length="barlength" :total-visible="11"></v-pagination>
    </div>
  </div>
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
    api: "",
    barlength: 1,
    sdate: null,
    edate: null,
    smenu: false,
    emenu: false,
    menu: false
  }),
  beforeMount: function() {
    this.load()
  },
  methods: {
    load: function() {
      let self = this
      if (process.env.NODE_ENV=="development") {
        self.api = "http://localhost:8081/api"
      } else {
        self.api = "https://nehs.daan.nctu.me/api"
      }
      window.console.log(self.api)
      axios.get(`${self.api}/get/count`)
        .then(res => {
          self.total = res.data
        })
        .then(() => {
          self.page = 1
          self.render()
        })
    },
    getcomments: function(id) {
      let self = this
      axios.get(`${self.api}/get/comments/${id}`).then(res => {
        self.show.forEach(o => {
          if (o.id == id) {
            o.comments = res.data
            o.showComment = !o.showComment
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
      if (self.sdate != null && self.edate!=null) {
        s = new Date(self.sdate).getTime()
        e = new Date(self.edate).getTime()
        window.console.log(s, e)
        if (new Date(e).getTime() < new Date(s).getTime()) {
          return
        }
      }
      axios.get(`${self.api}/search/${self.search}/${s}/${e}`).then(res => {
        if (res.data.length == 0) {
          self.load()
          return
        }
        self.total = []
        res.data.forEach(o => {
          self.total.push(o)
        })
        self.page = 1
        self.show = []
        self.render()
      })
    },
    cleanFilter: function () {
      this.sdate = null
      this.edate = null
    }
  }
}
</script>

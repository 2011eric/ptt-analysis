import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import VCharts from 'v-charts'

Vue.use(VCharts)

Vue.config.productionTip = false

new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')

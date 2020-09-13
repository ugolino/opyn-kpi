import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

import Buefy from 'buefy';
// import 'buefy/dist/buefy.css';

import Chartkick from 'vue-chartkick'
import Chart from 'chart.js'

import VueMoment from 'vue-moment'
import moment from 'moment-timezone'


Vue.use(VueMoment, {
  moment,
})

Vue.use(Buefy);

Vue.config.productionTip = false;

Vue.use(Chartkick.use(Chart))


// var numeral = require("numeral");

// Vue.filter("formatThousands", function (value) {
//   return numeral(value).format("0a");
// });

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");

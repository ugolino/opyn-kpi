<template>
  <div class="columns is-multiline my-4 ">
      <div class="column is-full">
        <div class="columns">
          <div class="column">
            <b-button type="is-primary"
              v-for="(item, index) in chartDataTypes" 
              :key="index"
              @click="selectedChartDataType = item"
              :class="[{'is-outlined' : selectedChartDataType != item }, 'mx-4' ]"
              >
                {{item}}
            </b-button>
          </div>
          
          <div class="column  has-text-right">
            <b-button type="is-primary"
              v-for="(item, index) in timeFrames" 
              :key="index"
              @click="selectedTimeFrame = item, updateStartDate(), getChartData()"
              :class="[{'is-outlined' : selectedTimeFrame != item }, 'mx-4']"
              >
                {{ item }} days
            </b-button>
          </div>
        </div>

        <p v-if="chartDataLastUpdate" class="is-small has-text-right">last updated: {{ chartDataLastUpdate - Date.now() | duration('humanize', true) }} (DefiPulse)</p>

        <column-chart :data="chartDataByType" thousands="," :colors="['#1abc9c']" :round="0" ></column-chart>
      </div>


      <div class="column is-half">
        <card v-if="insuranceCoverage.length > 0" :dataArray="insuranceCoverage" title="Insurance Coverage" :lastUpdate="insuranceCoverageLastUpdate" :isLoading="loadingInsuranceCoverageData" />
      </div>
      <div class="column is-half">
        <card v-if="usdLocked.length > 0" :dataArray="usdLocked" title="USD Locked" :lastUpdate="usdLockedLastUpdate" :isLoading="loadingUsdLockedData" />
      </div>

  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import api from '../../api'
import card from '../components/card'

export default {
  components: {
    card
  },
  data() {
    return {
      // insuranceCoverage: [],
      // usdLocked: []
      // chartData: [],
      loadingInsuranceCoverageData: false,
      loadingUsdLockedData: false,  
      chartDataTypes: ['tvlUSD','tvlETH','lockedETH','lockedDAI'],
      selectedChartDataType: "tvlUSD",
      timeFrames: [7, 30, 90],
      selectedTimeFrame: 30,
      startDate: null,
      endDate: null
    }
  },
  computed: {
    ...mapState({
      insuranceCoverage: state => state.kpi.insuranceCoverage,
      insuranceCoverageLastUpdate: state => state.kpi.insuranceCoverageLastUpdate,
      usdLocked: state => state.kpi.usdLocked,
      usdLockedLastUpdate: state => state.kpi.usdLockedLastUpdate,
      chartData: state => state.kpi.chartData,
      chartDataLastUpdate: state => state.kpi.chartDataLastUpdate,
    }),
    chartDataByTimeframe(){
      return this.chartData.filter( item => Date.parse(item.date) > Date.parse(this.startDate) && Date.parse(item.date) <= Date.parse(this.endDate) )
    },
    chartDataByType(){
      return this.chartDataByTimeframe.map( item =>  Object.values({ date: item.date, value: item.values[this.selectedChartDataType] }))
    },

  },
  mounted() {
    this.endDate = this.$moment().format('YYYY-MM-DD');
    this.updateStartDate();
    this.loadingInsuranceCoverageData = true
    api.getKpi('insurance-coverage')
    .then( res => {
      this.getInsuranceCoverageData(res)
      this.loadingInsuranceCoverageData = false
    });
    this.loadingUsdLockedData = true
    api.getKpi('usd-locked')
    .then( res => {
      this.getUsdLockedData(res)
      this.loadingUsdLockedData = false
    });
    if (!this.chartDataLastUpdate ||  ( (Math.abs(Date.now() - this.chartDataLastUpdate) / 36e5) > 12 ) ) {
      console.log('get history all')
      api.getKpi('history-all')
      .then( res => {
        console.log('response-history-all')
        console.log(res)
        this.getChartData(res)
      });
    } else {
      console.log("last time updated > 12hrs")
    }

  },
  methods: {
    ...mapActions({
      getInsuranceCoverageData: 'getInsuranceCoverageData',
      getUsdLockedData: 'getUsdLockedData',
      getChartData: 'getChartData'
    }),
    updateStartDate(){
      let dateOffset = (24*60*60*1000) * this.selectedTimeFrame;
      this.startDate = this.$moment( new Date - dateOffset ).format('YYYY-MM-DD')
    },
    // getChartData(){
    //   api.getKpi('history-all')
    //   .then( res => {
    //     this.chartData = res.sort((a, b) => new Date(a.date) - new Date(b.date))
    //   });
    // },
  }
}
</script>
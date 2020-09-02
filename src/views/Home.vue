<template>
  <div class="columns is-multiline my-4 ">

    <div class="column is-full">
      <div class="card has-text-centered">
        <header class="card-header">
          <p class="card-header-title">Total Volumes By Day</p>
        </header>
        <div class="card-content">
          <column-chart :data="totalVolumesByDay" thousands="," :colors="['#1abc9c']" :round="0" ></column-chart>
        </div>
      </div>
    </div>


    <div class="column is-half">
      <div class="card has-text-centered">
        <header class="card-header">
          <p class="card-header-title">Volumes By Option</p>
           <radar-spinner
            v-if="loadingVolumesByDay"
            :size="20"
            class="my-4 mb-4"
          />
        </header>
        <div class="card-content">
          <div class="content">
            <b-table
              :data=" showMoreOptions ? optionsList.slice(0, optionsList.length) : optionsList.slice(0, 10) "
              >
              <template slot-scope="props">
                <b-table-column field="name" label="name" >
                    {{ props['row']['name'] }}
                </b-table-column>
                <b-table-column field="totalSold" label="totalSold" numeric>
                  <b>{{ new Intl.NumberFormat('en-EN').format(props['row']['totalSold'].toFixed(0))  }} </b>
                </b-table-column>
                <b-table-column field="totalBought" label="totalBought" numeric>
                  <b>{{ new Intl.NumberFormat('en-EN').format(props['row']['totalBought'].toFixed(0))  }} </b>
                </b-table-column>
                <b-table-column field="total" label="total" numeric>
                  <b>{{ new Intl.NumberFormat('en-EN').format(props['row']['total'].toFixed(0))  }} </b>
                </b-table-column>
                <b-table-column >
                  <b-button type="is-primary" @click="showOptionOnChart(props['row']['name'])"> > </b-button>
                </b-table-column>
              </template>
            </b-table>
          </div>
        </div>
        <footer class="card-footer">
          <a v-if="!showMoreOptions" @click="showMoreOptions = true" class="card-footer-item">Show More</a>
          <a v-if="showMoreOptions" @click="showMoreOptions = false" class="card-footer-item">Show Less</a>
        </footer>
      </div>
    </div>

    <div class="column is-half">
      <div class="card has-text-centered">
        <header class="card-header">
          <p class="card-header-title">
            {{ selectedOptionForChart ? selectedOptionForChart.name : 'Option Detail' }}

          </p>
        </header>
        <div v-if="selectedOptionForChart" class="card-content">
          <div class="columns">
            <div class="column">
              <div class="buttons my-4">
                <b-button @click="selectedTypeForChart = 'totalSold'" :class="{'is-outlined' : selectedTypeForChart != 'totalSold'}" type="is-primary">
                  Sold
                </b-button>
                <b-button @click="selectedTypeForChart = 'totalBought'" :class="{'is-outlined' : selectedTypeForChart != 'totalBought'}" type="is-primary">
                  Bought
                </b-button>
              </div>
            </div>
          </div>
            <column-chart :data="chartDataForOption" thousands="," :colors="['#1abc9c']" :round="0" ></column-chart>
        </div>
        <div v-else>
            Select an option to see details
        </div>
      </div>
    </div>




      <div class="column is-half">
        <card v-if="insuranceCoverage.length > 0" :dataArray="insuranceCoverage" title="Insurance Coverage" :lastUpdate="insuranceCoverageLastUpdate" :isLoading="loadingInsuranceCoverageData" />
        <radar-spinner
          v-else
          :size="80"
          class="my-4 mb-4"
        />
      </div>
      <div class="column is-half">
        <card v-if="usdLocked.length > 0" :dataArray="usdLocked" title="USD Locked" :lastUpdate="usdLockedLastUpdate" :isLoading="loadingUsdLockedData" />
        <radar-spinner
          v-else
          :size="80"
          class="my-4 mb-4"
        />
      </div>

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

        <column-chart v-if="chartDataByType.length > 0" :data="chartDataByType" thousands="," :colors="['#1abc9c']" :round="0" ></column-chart>

        <radar-spinner
          v-else
          :size="80"
          class="my-4 mb-4"
        />
      </div>

  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import api from '../../api'
import card from '../components/card'
import {RadarSpinner} from 'epic-spinners'

export default {
  components: {
    card,
    RadarSpinner
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
      endDate: null,
      loadingVolumesByDay: false,
      showMoreOptions: false,
      selectedOptionForChart: null,
      selectedTypeForChart: 'totalSold'
    }
  },
  computed: {
    ...mapState({
      insuranceCoverage: state => state.kpi.insuranceCoverage,
      insuranceCoverageLastUpdate: state => state.kpi.insuranceCoverageLastUpdate,
      usdLocked: state => state.kpi.usdLocked,
      usdLockedLastUpdate: state => state.kpi.usdLockedLastUpdate,
      volumesByDay: state => state.kpi.volumesByDay,
      chartData: state => state.kpi.chartData,
      chartDataLastUpdate: state => state.kpi.chartDataLastUpdate,
    }),
    chartDataByTimeframe(){
      return this.chartData.filter( item => Date.parse(item.date) > Date.parse(this.startDate) && Date.parse(item.date) <= Date.parse(this.endDate) )
    },
    chartDataByType(){
      return this.chartDataByTimeframe.map( item =>  Object.values({ date: item.date, value: item.values[this.selectedChartDataType] }))
    },
    totalVolumesByDay(){
      const totalVolumes = []
      this.volumesByDay.map ( option => 
        option.totalBoughtByDate.map ( item =>
          totalVolumes.push({date: item.date, total: item.total})
        )
        && 
        option.totalSoldByDate.map ( item =>
          totalVolumes.push({date: item.date, total: item.total})
        )
      )
      let arrayTotVolumesByDay = this.groupAndSum(totalVolumes)
      return arrayTotVolumesByDay.sort((a, b) => new Date(a.date) - new Date(b.date)).map ( item =>
        Object.values({ date: item.date, value: item.total })
      )
    },
    optionsList(){
      return this.volumesByDay.map ( option => 
        { 
          let totalBought = option.totalBoughtByDate.slice(-1)[0] ? option.totalBoughtByDate.slice(-1)[0].cumulative : 0;
          let totalSold = option.totalSoldByDate.slice(-1)[0] ? option.totalSoldByDate.slice(-1)[0].cumulative : 0;
          console.log(totalBought);
          console.log(totalSold);
          return ({ 
            name: option.name, 
            totalBought: totalBought,
            totalSold: totalSold,
            total: totalSold + totalBought
          })
        }
      )
    },
    chartDataForOption(){
      if (this.selectedOptionForChart) {
        if (this.selectedTypeForChart === 'totalBought') {
          return this.selectedOptionForChart.totalBoughtByDate.map ( item => Object.values({ date: item.date, value: item.total }) )
        } else if (this.selectedTypeForChart === 'totalSold') {
          return this.selectedOptionForChart.totalSoldByDate.map ( item => Object.values({ date: item.date, value: item.total }) )
        }
      }
    }
  },
  mounted() {
    this.endDate = this.$moment().format('YYYY-MM-DD');
    this.updateStartDate();
    this.loadingInsuranceCoverageData = true
    // api.getKpi('insurance-coverage')
    // .then( res => {
    //   this.getInsuranceCoverageData(res)
    //   this.loadingInsuranceCoverageData = false
    // });
    // this.loadingUsdLockedData = true
    // api.getKpi('usd-locked')
    // .then( res => {
    //   this.getUsdLockedData(res)
    //   this.loadingUsdLockedData = false
    // });

    this.loadingVolumesByDay = true
    api.getKpi('volumes-by-day')
    .then( res => {
      this.getVolumesByDay(res)
      this.loadingVolumesByDay = false
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
      getVolumesByDay: 'getVolumesByDay',
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
    groupAndSum(array) {
      var groupedArray = [];
      array.reduce(function (res, v) {
          if (!res[v.date]) {
              res[v.date] = { date: v.date, total: 0 };
              groupedArray.push(res[v.date])
          }
          res[v.date].total += (parseInt(v.total));
          return res;
      }, {});

      return groupedArray
    },
    showOptionOnChart(name){
      let self = this
      self.selectedOptionForChart = self.volumesByDay.filter( option => option.name === name )[0]
    }
  }
}
</script>
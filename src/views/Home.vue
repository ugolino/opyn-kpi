<template>
  <div class="columns is-multiline my-4 ">

    <recapCard title="Daily Volumes" :currentValue="todayVolume" :previousValue="yesterdayVolume" :loading="loadingVolumesByDay ? true : false" />

    <recapCard title="Weekly Volumes" :currentValue="currentWeekVolume" :previousValue="previousWeekVolume" :loading="loadingVolumesByDay ? true : false" />
    
    <recapCard title="Monthly Volumes" :currentValue="currentMonthVolume" :previousValue="previousMonthVolume" :loading="loadingVolumesByDay ? true : false" />

    <div class="column is-full">
      <div class="card has-text-centered">
        <header class="card-header">
          <p class="card-header-title">Total Volumes</p>
          <radar-spinner
            v-if="loadingVolumesByDay"
            :size="20"
            class="my-4 mb-4"
          />
        </header>
        <div class="card-content">
          <div class="columns">
            <div class="column">
              <div class="buttons my-4">
                <b-button @click="selectedTimeFrameForVolumeChart = 'daily'" :class="{'is-outlined' : selectedTimeFrameForVolumeChart != 'daily'}" type="is-primary">
                  daily
                </b-button>
                <b-button @click="selectedTimeFrameForVolumeChart = 'weekly'" :class="{'is-outlined' : selectedTimeFrameForVolumeChart != 'weekly'}" type="is-primary">
                  weekly
                </b-button>
                <b-button @click="selectedTimeFrameForVolumeChart = 'monthly'" :class="{'is-outlined' : selectedTimeFrameForVolumeChart != 'monthly'}" type="is-primary">
                  monthly
                </b-button>
              </div>
            </div>
          </div>

          <column-chart :data="returnTotVolumes" thousands="," :colors="['#1abc9c']" :round="0" ></column-chart>
        </div>
      </div>
    </div>


    <div class="column is-full">
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
              :data=" showMoreOptions ? optionsList.slice(0, optionsList.length) : optionsList.slice(0, 7) "
              >
              <template slot-scope="props">
                <b-table-column field="name" label="name" >
                    {{ props['row']['name'] }}
                </b-table-column>
                <b-table-column field="totalSold" label="totalSold" numeric>
                  <b>{{ new Intl.NumberFormat('en-EN').format(props['row']['totalSold'].toFixed(0)) }}$ </b>
                </b-table-column>
                <b-table-column field="totalSold" label="Sold Transactions" numeric>
                  <b>{{ new Intl.NumberFormat('en-EN').format(props['row']['totalSoldTransactions']) }} 
                    ({{ new Intl.NumberFormat('en-EN').format( (props['row']['totalSold'] / props['row']['totalSoldTransactions']).toFixed(0)) }}$)
                  </b>
                </b-table-column>
                <b-table-column field="totalBought" label="totalBought" numeric>
                  <b>{{ new Intl.NumberFormat('en-EN').format(props['row']['totalBought'].toFixed(0)) }}$</b>
                </b-table-column>
                <b-table-column field="totalSold" label="Bought Transactions" numeric>
                  <b>{{ new Intl.NumberFormat('en-EN').format(props['row']['totalBoughtTransactions']) }}
                    ({{ new Intl.NumberFormat('en-EN').format( (props['row']['totalBought'] / props['row']['totalBoughtTransactions']).toFixed(0)) }}$)
                  </b>
                </b-table-column>
                <b-table-column field="total" label="Total" numeric>
                  <b>{{ new Intl.NumberFormat('en-EN').format(props['row']['total'].toFixed(0)) }}$</b>
                </b-table-column>
                <b-table-column field="total" label="Total Transactions" numeric>
                  <b>{{ new Intl.NumberFormat('en-EN').format(props['row']['totalSoldTransactions'] + props['row']['totalBoughtTransactions']) }}
                    ({{ new Intl.NumberFormat('en-EN').format( ( props['row']['total'] / (props['row']['totalSoldTransactions'] + props['row']['totalBoughtTransactions'])).toFixed(0)) }}$)
                  </b>
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

    <div class="column is-full">
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
                <b-button @click="selectedTypeForChart = 'total'" :class="{'is-outlined' : selectedTypeForChart != 'total'}" type="is-primary">
                  Total
                </b-button>
                <b-button @click="selectedTypeForChart = 'totalSold'" :class="{'is-outlined' : selectedTypeForChart != 'totalSold'}" type="is-primary">
                  Sold
                </b-button>
                <b-button @click="selectedTypeForChart = 'totalBought'" :class="{'is-outlined' : selectedTypeForChart != 'totalBought'}" type="is-primary">
                  Bought
                </b-button>
              </div>
            </div>
          </div>
            <column-chart :data="chartDataForOption" :zeros="true" thousands="," :colors="['#1abc9c']" :round="0" ></column-chart>
        </div>
        <div v-else>
            Select an option to see details
        </div>
      </div>
    </div>

    <div class="column is-full">
      <div class="card has-text-centered">
        <header class="card-header">
          <p class="card-header-title">Total Users</p>
        </header>
        <div class="card-content">
          <div class="columns">
            <div class="column">
              <div class="buttons my-4">
                <b-button @click="SelectedTimeframeForChartDataForUser = 'weekly'" :class="{'is-outlined' : SelectedTimeframeForChartDataForUser != 'weekly'}" type="is-primary">
                  Weekly
                </b-button>
                <b-button @click="SelectedTimeframeForChartDataForUser = 'monthly'" :class="{'is-outlined' : SelectedTimeframeForChartDataForUser != 'monthly'}" type="is-primary">
                  Monthly
                </b-button>
              </div>
            </div>
          </div>
          <column-chart :stacked="true" :data="chartDataForUser" thousands="," :colors="['#1abc9c', '#94849B']" :round="0" ></column-chart>
        </div>
      </div>
    </div>

    <div class="column is-full">
      <div class="card has-text-centered">
        <header class="card-header">
          <p class="card-header-title">Transactions</p>
        </header>
        <div class="card-content">
          <div class="columns">
            <div class="column">
              Sold
              <h3 class="title">
                {{ totalTransactions.totalSoldTransactions.length }}
              </h3>
            </div>
            <div class="column">
              Bought
              <h3 class="title">
                {{ totalTransactions.totalBoughtTransactions.length }}
              </h3>
            </div>
            <div class="column">
              total
              <h3 class="title">
                {{ totalTransactions.totalSoldTransactions.length + totalTransactions.totalBoughtTransactions.length }}
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="column is-full">
      <div class="card has-text-centered">
        <header class="card-header">
          <p class="card-header-title">Total Transactions</p>
        </header>
        <div class="card-content">
          <div class="columns">
            <div class="column">
              <div class="buttons my-4">
                <b-button @click="SelectedTimeframeForChartDataForTransactions = 'weekly'" :class="{'is-outlined' : SelectedTimeframeForChartDataForTransactions != 'weekly'}" type="is-primary">
                  Weekly
                </b-button>
                <b-button @click="SelectedTimeframeForChartDataForTransactions = 'monthly'" :class="{'is-outlined' : SelectedTimeframeForChartDataForTransactions != 'monthly'}" type="is-primary">
                  Monthly
                </b-button>
              </div>
            </div>
          </div>
          <column-chart :stacked="true" :data="chartDataForTransactions" thousands="," :colors="['#1abc9c', '#94849B']" :round="0" ></column-chart>
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

    <div class="column is-full">
      <div class="card has-text-centered">
        <header class="card-header">
          <p class="card-header-title">Oracle</p>
        </header>
        <div class="card-content">
          <div class="columns">
            <div class="column">
              Balance                
              <h3 class="title" v-if="oracleEthBalance > 0">
                {{ parseFloat(oracleEthBalance * 1e-18).toFixed(2) }} ETH
            </h3>
            </div>
          </div>
        </div>
      </div> 
    </div>

  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import api from '../../api'
import card from '../components/card'
import recapCard from '../components/recapCard'
import {RadarSpinner} from 'epic-spinners'
const utils = require('../../api/utils');

export default {
  components: {
    card,
    RadarSpinner,
    recapCard
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
      selectedTypeForChart: 'totalSold',
      selectedTimeFrameForVolumeChart: 'daily',
      SelectedTimeframeForChartDataForUser: 'weekly',
      SelectedTimeframeForChartDataForTransactions: 'weekly',
      oracleEthBalance: Number
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
    getTotVolumes(){
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
      console.log('totalVolumes', totalVolumes)
      return totalVolumes
    },

    totalVolumesByDay(){

      let totVolumesByDayArray = this.groupAndSum(this.getTotVolumes).sort((a, b) => new Date(a.date) - new Date(b.date))

      let startDate = totVolumesByDayArray[0] ? this.$moment.utc(totVolumesByDayArray[0].date).format('MM/DD/YY') : this.$moment.utc('2020-02-01').format('MM/DD/YY')
      let endDate = this.$moment.utc().format('MM/DD/YY')
     
      let dateArray = this.getDates(startDate, endDate)

      let TotVolumesByDayInclude0Array = []

      dateArray.map ( date => {
        let value = totVolumesByDayArray.filter( item => item.date === date ).length > 0 ? totVolumesByDayArray.filter( item => item.date === date )[0].total : 0
        TotVolumesByDayInclude0Array.push({ date: date, value: value })
      })

      return TotVolumesByDayInclude0Array


    },

    totalTransactions(){
      const totalBoughtTransactions = []
      const totalSoldTransactions = []
      this.volumesByDay.map ( option => {
        option.rawTotalBought.map ( item =>
          totalBoughtTransactions.push(item)
        )
        && 
        option.rawTotalSold.map ( item =>
          totalSoldTransactions.push(item)
        )
      })
      
      console.log('this.volumesByDay', this.volumesByDay)

      return {totalBoughtTransactions: totalBoughtTransactions, totalSoldTransactions: totalSoldTransactions}
    },

    totVolumesByWeek(){
      return this.groupAndSumByWeeks(this.totalVolumesByDay)
    },

    totVolumesByMonth(){
      return this.groupAndSumByMonths(this.totalVolumesByDay)
    },

    returnTotVolumes(){
      let array = []
      if (this.selectedTimeFrameForVolumeChart === "daily") {
        array = this.totalVolumesByDay
      } else if (this.selectedTimeFrameForVolumeChart === "weekly") {
        array = this.totVolumesByWeek
      } else if (this.selectedTimeFrameForVolumeChart === "monthly") {
        array = this.totVolumesByMonth
      }

      return array.map ( item => {
        return Object.values({ date: item.date, value: item. value})
      })

    },
    optionsList(){
      return this.volumesByDay.map ( option => 
        { 
          let totalBought = option.totalBoughtByDate.slice(-1)[0] ? option.totalBoughtByDate.slice(-1)[0].cumulative : 0;
          let totalSold = option.totalSoldByDate.slice(-1)[0] ? option.totalSoldByDate.slice(-1)[0].cumulative : 0;
          return ({ 
            id: option.id,
            name: option.name, 
            totalBought: totalBought,
            totalBoughtTransactions: option.rawTotalBought.length,
            totalSold: totalSold,
            totalSoldTransactions: option.rawTotalSold.length,
            total: totalSold + totalBought
          })
        }
      ).sort((a, b) => b.id - a.id)
    },
    chartDataForOption(){
      if (this.selectedOptionForChart) {

        let totals = []
        this.selectedOptionForChart.totalBoughtByDate.map ( totalBought => totals.push(totalBought))
        this.selectedOptionForChart.totalSoldByDate.map ( totalSold => totals.push(totalSold))

        let sortedTotals = totals.sort((a, b) => new Date(a.date) - new Date(b.date))
        let startDate = this.$moment.utc(sortedTotals[0].date).format('MM/DD/YY')
        let endDate = this.$moment.utc(sortedTotals[sortedTotals.length - 1].date).format('MM/DD/YY')

        let dateArray = this.getDates(startDate, endDate)

        let chartArray = []

        if (this.selectedTypeForChart === 'total') {
            let groupedArray = _(totals).groupBy( item => this.$moment.utc(item.date, 'MM/DD/YY') )
            .map((objs, key) => ({
              'date': this.$moment.utc(key).format('MM/DD/YY'),
              'total': _.sumBy(objs, 'total') }))
            .value()
            chartArray = groupedArray
        } else if (this.selectedTypeForChart === 'totalBought') {
          chartArray = this.selectedOptionForChart.totalBoughtByDate
        } else if (this.selectedTypeForChart === 'totalSold') {
          chartArray = this.selectedOptionForChart.totalSoldByDate
        }

        let chartArrayInclude0 = []

        dateArray.map ( date => {
          let value = chartArray.filter( item => item.date === date ).length > 0 ? chartArray.filter( item => item.date === date )[0].total : 0
          chartArrayInclude0.push({ date: date, value: value })
        })

        return chartArrayInclude0.map ( item => Object.values({ date: item.date, value: item.value }) )

      }
    },

    todayVolume(){
      let value = this.totalVolumesByDay[this.totalVolumesByDay.length - 1] ? this.totalVolumesByDay[this.totalVolumesByDay.length - 1].value : null
      return { label: "Today", value: value }
    },
    yesterdayVolume(){
      let value = this.totalVolumesByDay[this.totalVolumesByDay.length - 2] ? this.totalVolumesByDay[this.totalVolumesByDay.length - 2].value : null
      return { label: "Yesterday", value: value }
    },
    last30daysVolume(){
      return this.totalVolumesByDay.slice(Math.max(this.totalVolumesByDay.length - 31, 1))
    },
    currentWeekVolume(){
      let value = this.totVolumesByWeek[this.totVolumesByWeek.length - 1] ? this.totVolumesByWeek[this.totVolumesByWeek.length - 1].value : null
      return { label: "Current Week", value: value }
    },
    previousWeekVolume(){
      let value = this.totVolumesByWeek[this.totVolumesByWeek.length - 2] ? this.totVolumesByWeek[this.totVolumesByWeek.length - 2].value : null
      return { label: "Previous Week", value: value }
    },
    currentMonthVolume(){
      let value = this.totVolumesByMonth[this.totVolumesByMonth.length - 1 ] ? this.totVolumesByMonth[this.totVolumesByMonth.length - 1 ].value : null
      return { label: "Current Month", value: value }
    },
    previousMonthVolume(){
      let value = this.totVolumesByMonth[this.totVolumesByMonth.length - 2] ? this.totVolumesByMonth[this.totVolumesByMonth.length - 2].value : null
      return { label: "Previous Month", value: value }
    },

    totSoldUsers(){
      let allTransactions = []
      console.log('this.volumesByDay', this.volumesByDay)
      if (this.volumesByDay) {
        this.volumesByDay.map( item => {
          item.rawTotalSold.map ( transaction =>{
            allTransactions.push(transaction)
          })
        })
      }


      return allTransactions
    },

    totBoughtUsers(){
      let allTransactions = []
      if (this.volumesByDay) {
        this.volumesByDay.map( item => {
          item.rawTotalBought.map ( transaction =>{
            allTransactions.push(transaction)
          })
        })
      }
      return allTransactions
    },

    chartDataForTransactions(){
      let totSold = []
      let totBought = []


      if (this.SelectedTimeframeForChartDataForTransactions === "weekly") {
        totSold = this.usersByWeek(this.totSoldUsers.sort((a, b) => new Date(a.date) - new Date(b.date))).map ( 
          item => Object.values({ date: item.date, value: item.users.length }) 
        )
        totBought = this.usersByWeek(this.totBoughtUsers.sort((a, b) => new Date(a.date) - new Date(b.date))).map ( 
          item => Object.values({ date: item.date, value: item.users.length }) 
        )
      } else {
        totSold = this.usersByMonth(this.totSoldUsers.sort((a, b) => new Date(a.date) - new Date(b.date))).map ( 
          item => Object.values({ date: item.date, value: item.users.length }) 
        )
        totBought = this.usersByMonth(this.totBoughtUsers.sort((a, b) => new Date(a.date) - new Date(b.date))).map ( 
          item => Object.values({ date: item.date, value: item.users.length }) 
        )       
      }

      return [
        { 
          name: 'sold',
          data: totSold
        },
        { 
          name: 'bought',
          data: totBought
        }

      ]

    },

    chartDataForUser(){

      let totSold = []
      let totBought = []

      if (this.SelectedTimeframeForChartDataForUser === "weekly") {
        totSold = this.usersByWeek(this.totSoldUsers.sort((a, b) => new Date(a.date) - new Date(b.date))).map ( 
          item => Object.values({ date: item.date, value: new Set(item.users).size }) 
        )
        totBought = this.usersByWeek(this.totBoughtUsers.sort((a, b) => new Date(a.date) - new Date(b.date))).map ( 
          item => Object.values({ date: item.date, value: new Set(item.users).size }) 
        )
      } else {
        totSold = this.usersByMonth(this.totSoldUsers.sort((a, b) => new Date(a.date) - new Date(b.date))).map ( 
          item => Object.values({ date: item.date, value: new Set(item.users).size }) 
        )
        totBought = this.usersByMonth(this.totBoughtUsers.sort((a, b) => new Date(a.date) - new Date(b.date))).map ( 
          item => Object.values({ date: item.date, value: new Set(item.users).size }) 
        )       
      }


      return [
        { 
          name: 'sold',
          data: totSold
        },
        { 
          name: 'bought',
          data: totBought
        }

      ]

    }


  },

  async mounted() {
    this.endDate = this.$moment.utc().format('YYYY-MM-DD');
    this.updateStartDate();

    this.oracleEthBalance = await utils.getBalanceFromAddress('0xb815fdc4c3ea561bacddf6c693da525bda570fa2');

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
      this.startDate = this.$moment.utc( new Date - dateOffset ).format('YYYY-MM-DD')
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
      this.selectedTypeForChart = "total"
      self.selectedOptionForChart = self.volumesByDay.filter( option => option.name === name )[0]
    },

    getDates(startDate, endDate) {
      var dateArray = [];
      var currentDate = this.$moment.utc(startDate);
      var endDate = this.$moment.utc(endDate);
      while (currentDate <= endDate) {
          dateArray.push( this.$moment.utc(currentDate).format('MM/DD/YY') )
          currentDate = this.$moment.utc(currentDate).add(1, 'days');
      }
      return dateArray;
    },

    groupAndSumByWeeks(array){
      let groupedResults = _(array)
      .groupBy( item => this.$moment.utc(item['date'], 'MM/DD/YY').startOf('isoWeek') )
      .map((objs, key) => ({
        'date': this.$moment.utc(key).format('MM/DD/YY'),
        'value': _.sumBy(objs, 'value') }))
      .value()

      return groupedResults

    },

    groupAndSumByMonths(array){

      let groupedResults = _(array)
      .groupBy( item => this.$moment.utc(item['date'], 'MM/DD/YY').startOf('month') )
      .map((objs, key) => ({
        'date': this.$moment.utc(key).format('MMM YY'),
        'value': _.sumBy(objs, 'value') }))
      .value()

      return groupedResults

    },

    usersByWeek(array){
      let arrayByWeek = _(array)
      .groupBy( item => this.$moment.utc(item['date'], 'MM/DD/YY').startOf('isoWeek') )
      .map((objs, key) => ({
        'date': this.$moment.utc(key).format('MM/DD/YY'),
          'users': objs.map ( obj => {
            return obj.address
          })
        }))
      .value()

      return arrayByWeek
    },

    usersByMonth(array){
      let arrayByMonth = _(array)
      .groupBy( item => this.$moment.utc(item['date'], 'MM/DD/YY').startOf('month') )
      .map((objs, key) => ({
        'date': this.$moment.utc(key).format('MMM YY'),
          'users': objs.map ( obj => {
            return obj.address
          })
        }))
      .value()

      return arrayByMonth
    }

  }
}
</script>
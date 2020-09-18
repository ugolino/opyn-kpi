<template>
  <div class="columns is-multiline my-4 ">

    <div class="column">
      <div class="card has-text-centered">
        <header class="card-header">
          <p class="card-header-title">Daily Volumes</p>
          <radar-spinner
            v-if="loadingVolumesByDay"
            :size="20"
            class="my-4 mb-4"
          />
        </header>
        <div class="card-content">
          <div class="columns">
            <div class="column">
              today 
              <h3 class="title">
                {{ todayVolume | numeral('$0.0a') }}
                <span class="subtitle">{{ (((  todayVolume / yesterdayVolume ) - 1)) | numeral('+0%') }}</span>
              </h3>
            </div>
            <div class="column">
              yesterday 
              <h3 class="title">{{ yesterdayVolume | numeral('$0.0a') }}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="column">
      <div class="card has-text-centered">
        <header class="card-header">
          <p class="card-header-title">Weekly Volumes</p>
          <radar-spinner
            v-if="loadingVolumesByDay"
            :size="20"
            class="my-4 mb-4"
          />
        </header>
        <div class="card-content">
          <div class="columns">
            <div class="column">
              current week 
              <h3 class="title">
                {{ currentWeekVolume | numeral('$0.0a') }}
                <span class="subtitle">{{ (((  currentWeekVolume / previousWeekVolume ) - 1)) | numeral('+0%') }}</span>
              </h3>
            </div>
            <div class="column">
              previuos week 
              <h3 class="title">{{ previousWeekVolume | numeral('$0.0a') }}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="column">
      <div class="card has-text-centered">
        <header class="card-header">
          <p class="card-header-title">Monthly Volumes</p>
          <radar-spinner
            v-if="loadingVolumesByDay"
            :size="20"
            class="my-4 mb-4"
          />
        </header>
        <div class="card-content">
          <div class="columns">
            <div class="column">
              current month 
              <h3 class="title">
                {{ currentMonthVolume | numeral('$0.0a') }}
                <span class="subtitle">{{ (((  currentMonthVolume / previousMonthVolume ) - 1)) | numeral('+0%') }}</span>
              </h3>
            </div>
            <div class="column">
              previuos month 
              <h3 class="title">{{ previousMonthVolume | numeral('$0.0a') }}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>



    

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
              :data=" showMoreOptions ? optionsList.slice(0, optionsList.length) : optionsList.slice(0, 7) "
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
      selectedTypeForChart: 'totalSold',
      selectedTimeFrameForVolumeChart: 'daily'
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
      let arrayTotVolumesByDay = this.groupAndSum(totalVolumes).sort((a, b) => new Date(a.date) - new Date(b.date))
      let startDate = arrayTotVolumesByDay[0] ? this.$moment(arrayTotVolumesByDay[0].date).format('MM/DD/YY') : this.$moment('2020-02-01').format('MM/DD/YY')
      let endDate = this.$moment().format('MM/DD/YY')
     
      let dateArray = this.getDates(startDate, endDate)

      let arrayTotVolumesByDayInclude0 = []

      dateArray.map ( date => {
        let value = arrayTotVolumesByDay.filter( item => item.date === date ).length > 0 ? arrayTotVolumesByDay.filter( item => item.date === date )[0].total : 0
        arrayTotVolumesByDayInclude0.push({ date: date, value: value })
      })

      return arrayTotVolumesByDayInclude0


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
            totalSold: totalSold,
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
        let startDate = this.$moment(sortedTotals[0].date).format('MM/DD/YY')
        let endDate = this.$moment(sortedTotals[sortedTotals.length - 1].date).format('MM/DD/YY')

        let dateArray = this.getDates(startDate, endDate)

        let chartArray = []

        if (this.selectedTypeForChart === 'total') {
            let groupedArray = _(totals).groupBy( item => this.$moment(item.date, 'MM/DD/YY') )
            .map((objs, key) => ({
              'date': this.$moment(key).format('MM/DD/YY'),
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
      return this.totalVolumesByDay[this.totalVolumesByDay.length - 1].value
    },
    yesterdayVolume(){
      return this.totalVolumesByDay[this.totalVolumesByDay.length - 2].value
    },
    currentWeekVolume(){
      return this.totVolumesByWeek[this.totVolumesByWeek.length - 1].value
    },
    previousWeekVolume(){
      return this.totVolumesByWeek[this.totVolumesByWeek.length - 2].value
    },
    currentMonthVolume(){
      return this.totVolumesByMonth[this.totVolumesByMonth.length - 1 ].value
    },
    previousMonthVolume(){
      return this.totVolumesByMonth[this.totVolumesByMonth.length - 2].value
    }



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
      this.selectedTypeForChart = "total"
      self.selectedOptionForChart = self.volumesByDay.filter( option => option.name === name )[0]
    },

    getDates(startDate, endDate) {
      var dateArray = [];
      var currentDate = this.$moment(startDate);
      var endDate = this.$moment(endDate);
      while (currentDate <= endDate) {
          dateArray.push( this.$moment(currentDate).format('MM/DD/YY') )
          currentDate = this.$moment(currentDate).add(1, 'days');
      }
      return dateArray;
    },

    groupAndSumByWeeks(array){
      let groupedResults = _(array)
      .groupBy( item => this.$moment(item['date'], 'MM/DD/YY').startOf('isoWeek') )
      .map((objs, key) => ({
        'date': this.$moment(key).format('MM/DD/YY'),
        'value': _.sumBy(objs, 'value') }))
      .value()

      return groupedResults

    },

    groupAndSumByMonths(array){

      let groupedResults = _(array)
      .groupBy( item => this.$moment(item['date'], 'MM/DD/YY').startOf('month') )
      .map((objs, key) => ({
        'date': this.$moment(key).format('MMM YY'),
        'value': _.sumBy(objs, 'value') }))
      .value()

      return groupedResults

    },
    


  }
}
</script>
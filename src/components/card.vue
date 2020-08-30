<template>
  <div class="card  has-text-centered">
    <header class="card-header">
      <p class="card-header-title">
        {{ title }}
      </p>
      <radar-spinner
          v-if="isLoading"
          :size="20"
          class="my-4 mb-4"
     />
    </header>
    <div class="card-content">
      <div class="content">
        <p class="has-text-right is-small has-text-right">last updated: {{ lastUpdate - Date.now() | duration('humanize', true) }} (Infura)</p>
        <div v-if="onlyTotals.length > 0" class="columns">
          <div v-for="(item, index) in onlyTotals" :key="index" class="column">
            <h2 class="is-size-2">
              {{ new Intl.NumberFormat('en-EN').format(item.value.toFixed(0))  }} 
              <span class="is-size-5" >{{ item.currency }}</span> 
            </h2>
          </div>
        </div>


          <div v-if="currencies.length > 1" class="buttons my-4">
            <b-button type="is-primary"
              v-for="(currency, index) in currencies" 
              :key="index"
              @click="selectedCurrency = currency"
              :class="{'is-outlined' : selectedCurrency != currency}"
              >
                {{currency}}
              </b-button>
          </div>


        <div v-if="filterSubTotalsByCurrencies.length > 0" class="columns">
          <div v-for="(item, index) in filterSubTotalsByCurrencies" :key="index" class="column">
            <h2 class="is-size-4">
              {{ new Intl.NumberFormat('en-EN').format(item.value.toFixed(0))  }} 
              <span class="is-size-5" >{{ item.currency }}</span> 
            </h2>
            <p><b>{{ item.name }}</b></p>
          </div>
        </div>

        <b-table
          :data=" showMore ? withoutTotalsByCurrency.slice(0, withoutTotalsByCurrency.length) : withoutTotalsByCurrency.slice(0, 5) "
          >
          <template slot-scope="props">
            <b-table-column field="name" label="name" >
                {{ props['row']['name'] }}
            </b-table-column>
            <b-table-column field="value" label="value" numeric>
              <b>{{ new Intl.NumberFormat('en-EN').format(props['row']['value'].toFixed(0))  }} </b>
            </b-table-column>
            <b-table-column field="currency" label="currency" >
              <b>{{ props['row']['currency'] }}</b>
            </b-table-column>
            <b-table-column 
              field="percentage" 
              label="% of total"
              numeric
              v-if="onlyTotals[0].value && onlyTotals[0].currency === props['row']['currency']">
              {{ ((props['row']['value'] / onlyTotals[0].value) * 100).toFixed(0) }} %
            </b-table-column>
            <b-table-column 
              field="percentage" 
              label="% of total"
              numeric
              v-else-if="filterSubTotalsByCurrencies[0].value && filterSubTotalsByCurrencies[0].currency === props['row']['currency']">
              {{ ((props['row']['value'] / filterSubTotalsByCurrencies[0].value) * 100).toFixed(0) }} %
            </b-table-column>
          </template>
        </b-table>

      </div>
      <footer class="card-footer">
        <a v-if="!showMore" @click="showMore = true" class="card-footer-item">Show More</a>
        <a v-if="showMore" @click="showMore = false" class="card-footer-item">Show Less</a>
      </footer>
    </div>
  </div>
</template>

<script>
  import {RadarSpinner} from 'epic-spinners'


export default {
  props: {
    dataArray: Array,
    title: String,
    lastUpdate: Number,
    isLoading: Boolean
  },
  data()   {
    return {
      showMore: false,
      currencies: [],
      selectedCurrency: null
    }
  },
  components: {
    RadarSpinner
  },
  computed: {
    onlyTotals(){
      if (this.dataArray.length > 0) {
        return this.dataArray.filter( item => item.name.toLowerCase() === "total" )
      }
      
    },
    subTotals(){
      if (this.dataArray.length > 0) {
        return this.dataArray.filter( item => item.name.toLowerCase() != "total" && item.name.toLowerCase().includes("total") ) 
      }
    },
    filterSubTotalsByCurrencies(){
      if (this.selectedCurrency) {
        return this.subTotals.filter( item => item.name.toLowerCase().includes(this.selectedCurrency.toLowerCase()) )
      }
      else {
        return this.subTotals.filter( item => item.name.toLowerCase() )
      } 
    },
    withoutTotals(){
      if (this.dataArray.length > 0) {
        return this.dataArray.filter( item => !item.name.toLowerCase().includes("total") )
      }
    },
    withoutTotalsByCurrency(){
      if (this.dataArray.length > 0) {
        return this.withoutTotals.filter( item => item.currency === this.selectedCurrency).sort((a, b) => (a.value < b.value) ? 1 : -1)
      }
    },
    
  },
  mounted(){
    this.getCurrencies()
  },
  methods: {
    getCurrencies(){
      this.currencies = [...new Set(this.withoutTotals.map(item => item.currency))]
      this.selectedCurrency = this.currencies[1]
    }
  }
  
}
</script>
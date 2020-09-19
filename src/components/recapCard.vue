<template>

  <div class="column">
    <div class="card has-text-centered">
      <header class="card-header">
        <p class="card-header-title">{{ title }}</p>
        <radar-spinner
          v-if="loading"
          :size="20"
          class="my-4 mb-4"
        />
      </header>
      <div class="card-content">
        <div class="columns">
          <div class="column">
            {{ currentValue.label }}
            <h3 class="title">
              {{ currentValue.value | numeral('$0.0a') }}
              <span class="subtitle" v-if="currentValue && previousValue ">
                {{ (((  currentValue.value / previousValue.value ) - 1)) | numeral('+0%') }}
              </span>
            </h3>
          </div>
          <div class="column">
            yesterday 
            <h3 class="title">
              {{ previousValue.value | numeral('$0.0a')  }}
            </h3>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script>
import {RadarSpinner} from 'epic-spinners'

export default {
  props: {
    title: String,
    currentValue: Object,
    previousValue: Object,
    loading: Boolean
  },
  components: {
    RadarSpinner
  },
}
</script>
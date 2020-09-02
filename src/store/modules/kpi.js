const defaultState = {
  insuranceCoverage: [],
  insuranceCoverageLastUpdate: null,
  usdLocked: [],
  usdLockedLastUpdate: null,
  volumesByDay: [],
  volumesByDayLastUpdate: null,
  chartData: [],
  chartDataLastUpdate: null
}

const getters = {
  insuranceCoverage(state){
    return state.insuranceCoverage
  },
  usdLocked(state) {
    return state.usdLocked
  },
  volumesByDay(state) {
    return state.volumesByDay
  },
  chartData(state) {
    return state.chartData
  },
  chartDataLastUpdate(state) {
    return state.chartDataLastUpdate
  },
}

export const actions = {
  getInsuranceCoverageData({ commit }, payload) {
    commit('addInsuranceCoverageData', payload)
  },
  getUsdLockedData({ commit }, payload) {
    commit('addUsdLockedData', payload)
  },
  getVolumesByDay({ commit }, payload) {
    console.log('getVolumesByDay')
    commit('addVolumesByDay', payload)
  },
  getChartData({ commit }, payload) {
    commit('addChartData', payload)
  },
}

export const mutations = {

  addInsuranceCoverageData(state, payload) {  
    state.insuranceCoverage = payload
    state.insuranceCoverageLastUpdate = Date.now()
  },

  addUsdLockedData(state, payload) {
    state.usdLocked = payload
    state.usdLockedLastUpdate = Date.now()
  },

  addVolumesByDay(state, payload) {
    console.log('addVolumesByDay')
    state.volumesByDay = payload
    state.volumesByDayLastUpdate = Date.now()
  },

  addChartData(state, payload) {
    state.chartData = payload.sort((a, b) => new Date(a.date) - new Date(b.date))
    state.chartDataLastUpdate = Date.now()
  },

}

export default {
  state: defaultState,
  actions,
  mutations,
  getters: getters
}
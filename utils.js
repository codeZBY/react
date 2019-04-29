import constants from './constants'

export default class Utils {
  static getLocationParam(paramName) {
    let paramSets = window.location.search.substring(1).split('&')
    let paramValue = null
    for (let i = 0, len = paramSets.length; i < len; i++) {
      let paramPair = paramSets[i].split('=')
      if (paramPair[0] === paramName && paramPair[1]) {
        paramValue = paramPair[1]
        break
      }
    }
    return paramValue
  }
  static updateStatebyKeys(state, keys, newData) {
    if (keys) {
      return state.hasIn(keys) ? state.updateIn(keys, data => data = newData) : state.setIn(keys, newData)
    }
    return state.merge(newData)
  }
  static isLOCALMode() {
    return !!process.env.isLocal
  }
  static logger(msg) {
    this.isLOCALMode() && console.log(msg)
  }
  static getTrueStyle(obj, attr) {
    if (obj.currentStyle) { //ie
      return obj.currentStyle[attr];
    } else {
      return window.getComputedStyle(obj, null)[attr] || document.defaultView.getComputedStyle(obj, null)[attr];
    }
  }
}

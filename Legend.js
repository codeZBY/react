import React, { useRef, useState, useEffect, useReducer } from 'react'
import { createPortal } from 'react-dom'
import PropTypes from 'prop-types'
import cx from 'classnames'

import Utils from '../../utils/utils'

function reducer(state, action) {
  switch (action.type) {
    case 'mouseAction':
      return { ...state, positionInfo: action.positionInfo }
      break
    default:
      return state
  }
}

function Legend(props) {
  const { savePosInfo, legendContainer, className, textArr } = props,
    legend = useRef(null),
    dragEl = useRef(null),
    [width, setWidth] = useState(props.width),
    [renderEnd, setRenderEnd] = useState(false), // the first time render shouldn't limit <div className='legend'></div> style, need get the integral width of childNode
    [showLegend, setLegend] = useState(true),
    [statsWidArr] = useState([]),
    [calcResult] = useState({}),
    [{ positionInfo }, dispatch] = useReducer(reducer, props)
  let draging = false
  const handleOnEle = e => {
    e.nativeEvent.preventDefault()
    e.stopPropagation()
    e.persist()
    let { left, top } = positionInfo,
      isDrag = e.currentTarget === dragEl.current,
      width = parseInt(/\d+/.exec(Utils.getTrueStyle(legend.current, 'width'))),
      height = parseInt(/\d+/.exec(Utils.getTrueStyle(legend.current, 'height'))),
      pageX = e.pageX,
      pageY = e.pageY,
      boundary = legendContainer.boundary,
      newPosInfo = positionInfo

    let handling = e => {
      e.stopPropagation()
      draging = true
      let curPageX = e.pageX,
        curPageY = e.pageY,
        diffLOW = curPageX - pageX,
        diffTOH = curPageY - pageY
      newPosInfo = isDrag ?
        {
          left: left,
          top: top,
          width: Math.min(width + diffLOW, boundary.width - left),
          height: Math.min(height + diffTOH, boundary.height - top)
        } : {
          left: left + diffLOW + width >= boundary.width ? boundary.width - width : Math.max(0, left + diffLOW),
          top: top + diffTOH + height >= boundary.height ? boundary.height - height : Math.max(0, top + diffTOH),
          width: width,
          height: height
        }
      return dispatch({
        type: 'mouseAction',
        positionInfo: newPosInfo
      })
    }

    let handleEnd = e => {
      e.stopPropagation()
      document.removeEventListener('mousemove', handling)
      document.removeEventListener('mouseup', handleEnd)
      if (draging) {
        savePosInfo && savePosInfo(newPosInfo)
        draging = false
      }
    }

    document.addEventListener('mousemove', handling, false)
    document.addEventListener('mouseup', handleEnd, false)
  }

  useEffect(() => {
    // get all stats width, then calculate the max width
    statsWidArr.map(arr => {
      arr.map(a => {
        if (!calcResult[Object.keys(a)]) {
          calcResult[Object.keys(a)] = Object.values(a)
        } else {
          calcResult[Object.keys(a)].push(Object.values(a)[0])
        }
      })
    })

    let resultKeys = Object.keys(calcResult),
      statsWidth = 0
    resultKeys.map(key => {
      let maxWidth = Math.max(...calcResult[key])
      calcResult[key] = maxWidth + 4 // + more 4 px is used to set between space(Max: 2), if not add, will be Max:2
      statsWidth += maxWidth
    })
    setWidth(Object.assign({}, width, calcResult, { statsWidth: statsWidth }))
    setRenderEnd(true)
  }, [])

  function collectLegendWidth(w) {
    statsWidArr.push(w)
  }

  function closeLegend() {
    setLegend(false)
    props.setLegend && props.setLegend(false)
  }

  useEffect(() => {
    legendContainer.container.appendChild(legend.current)
    return () => {
      legendContainer.container.removeChild(legend.current)
    }
  }, [legend])

  return createPortal(showLegend && <div className={cx('legend', className)} ref={legend} onMouseDown={e => handleOnEle(e)} style={renderEnd ? {
    width: positionInfo.width,
    height: positionInfo.height,
    top: positionInfo.top,
    left: positionInfo.left,
    maxWidth: legendContainer.boundary.width - positionInfo.left,
    maxHeight: legendContainer.boundary.height - positionInfo.top
  } : {}}>
    <div className='legend__close-icon' onMouseDown={e => {
      e.stopPropagation()
      closeLegend(false)
    }}></div>
    <div className='legend__resize-icon' ref={dragEl} onMouseDown={e => handleOnEle(e)}></div>
    {
      textArr.map((option, index) => {
        return <LegendContent key={index} {...Object.assign(option, { width: width }, { collectLegendWidth: collectLegendWidth }) } />
      })
    }
  </div>, legendContainer.container)
}

function LegendContent(props) {
  const { stats, color, legend, collectLegendWidth } = props,
    [statsWidArr] = useState([]),
    legendEle = useRef(null)

  useEffect(() => {
    statsWidArr.push({ legendWidth: getWidth(legendEle.current) + 2 })
    collectLegendWidth(statsWidArr)
  }, [])

  function collectiStatsWidth(w) {
    statsWidArr.push(w)
  }

  return <div className='legend__content'>
    <span className='legend__content--rect' style={{
      backgroundColor: color
    }}></span>
    <span className='legend__content--text-legend' ref={legendEle} style={{
      width: props.width.legendWidth
    }}>
      {legend}
    </span>
    <div className='legend__stats' style={{
      width: props.width.statsWidth
    }}>
      {
        Object.keys(stats).map((s, i) => {
          return <LegendStats key={i} {...{
            statsText: stats[s],
            typeWidth: props.width[`${s}Width`],
            statsType: s,
            collectWidth: collectiStatsWidth
          }} />
        })
      }
    </div>
  </div>
}

function LegendStats(props) {
  const stats = useRef(null),
    { statsType, statsText, collectWidth } = props

  useEffect(() => {
    collectWidth({ [`${statsType}Width`]: getWidth(stats.current) })
  }, [])

  return <div className='legend__stats--text' ref={stats} style={{
    width: props.typeWidth
  }}>
    <span>{statsText && (statsText.split(':')[0] + (statsText ? ':' : ''))}</span>
    <span>{statsText && (statsText.split(':').slice(1).join(':'))}</span>
  </div>
}

function getWidth(el) {
  if (!el) return null

  let marginLeft = parseInt(/\d+/.exec(Utils.getTrueStyle(el, 'marginLeft'))),
    marginRight = parseInt(/\d+/.exec(Utils.getTrueStyle(el, 'marginRight'))),
    offsetWidth = el.offsetWidth

  return marginLeft + offsetWidth + marginRight
}


Legend.defaultProps = {
  legendContainer: {
    container: document.getElementById('charting3'),
    boundary: {
      width: 1000,
      height: 400
    }
  },
  positionInfo: {
    top: 20,
    left: 50,
    width: 600,
    height: 300
  },
  width: {
    legendWidth: 'auto',
    statsWidth: 'auto',
    lastWidth: 'auto',
    minWidth: 'auto',
    maxWidth: 'auto',
    meanWidth: 'auto',
    sdWidth: 'auto',
    lzWidth: 'auto',
    lpWidth: 'auto'
  },
  textArr: [
    {
      color: "#0077CC",
      last: "Last:1114 on 16/04/2019",
      legend: "Index Value, LOCAL, WGBI [L]",
      stats: {
        lp: "Percentile: 35",
        lz: "Z-Score: 0",
        max: "",
        mean: "Mean: 4",
        min: "Min: 4 on 29/03/2019",
        sd: "Std. Dev.: 0",
      }
    },
    {
      color: "#B60000",
      last: "Last: 752 on 24/04/2019",
      legend: "Oil Price BRENT Index Data [L]",
      stats: {
        lp: "Percentile: 183",
        lz: "Z-Score: -1",
        max: "Max: 756 on 27/03/2019",
        mean: "Mean: 747",
        min: "Min: 741 on 03/04/2018",
        sd: "Std. Dev.: 5"
      }
    }
  ],
  savePosInfo: () => {},
  setLegend: () => {}
}

Legend.PropTypes = {
  positionInfo: PropTypes.shape({
    top: PropTypes.number,
    left: PropTypes.number,
    width: PropTypes.oneOf(['auto', PropTypes.number]),
    height: PropTypes.oneOf(['auto', PropTypes.number])
  }),
  width: PropTypes.shape({
    lastWidth: PropTypes.oneOf(['auto', PropTypes.number]),
    minWidth: PropTypes.oneOf(['auto', PropTypes.number]),
    maxWidth: PropTypes.oneOf(['auto', PropTypes.number]),
    meanWidth: PropTypes.oneOf(['auto', PropTypes.number]),
    sdWidth: PropTypes.oneOf(['auto', PropTypes.number]),
    lzWidth: PropTypes.oneOf(['auto', PropTypes.number]),
    lpWidth: PropTypes.oneOf(['auto', PropTypes.number]),
    legendWidth: PropTypes.oneOf(['auto', PropTypes.number]),
    statsWidth: PropTypes.oneOf(['auto', PropTypes.number])
  }),
  legendContainer: PropTypes.shape({
    container: PropTypes.node,
    boundary: PropTypes.objectOf({
      width: PropTypes.number,
      height: PropTypes.number
    })
  }),
  textArr: PropTypes.shape({
    color: PropTypes.string,
    last: PropTypes.string,
    legend: PropTypes.string,
    stats: PropTypes.shape({
      lp: PropTypes.string,
      lz: PropTypes.string,
      max: PropTypes.string,
      mean: PropTypes.string,
      min: PropTypes.string,
      sd: PropTypes.string,
    })
  }),
  savePosInfo: PropTypes.func,
  setLegend: PropTypes.func
}

export default React.memo(Legend)

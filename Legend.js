import React, { Component, useState, useEffect, createRef } from 'react'
import { createPortal, findDOMNode } from 'react-dom'
import PropTypes from 'prop-types'
import cx from 'classnames'

import Utils from '../../utils/utils'

const legendRoot = document.querySelector('#charting3')
export default class Legend extends Component {
  static defaultProps = {
    lengendContainer: {
      container: legendRoot,
      boundary: {
        width: 1000,
        height: 400
      }
    },
    positionInfo: {
      top: 0,
      left: 0,
      width: 'auto',
      height: 'auto'
    },
    width: {
      legendWidth: 'auto',
      statsWidth: 'auto',
      lastTextWidth: 'auto',
      minTextWidth: 'auto',
      maxTextWidth: 'auto',
      meanTextWidth: 'auto',
      sdTextWidth: 'auto',
      lzTextWidth: 'auto',
      lpTextWidth: 'auto'
    },
    textArr: [
      {
        color: "#007377",
        last: "Last:1114 on 16/04/2019",
        legend: "USD.AED, FX Spot",
        lp: "asd df gh",
        lz: "qw sdf ggg",
        max: "Max: 4 on 09/02/2019",
        mean: "Mean: 4",
        min: "Min: 4 on 29/03/2019",
        sd: "Std. Dev.: 0",
      },
      {
        color: "#C99700",
        last: "Last: 2 on 16/04/2019",
        legend: "15Y FNMA 102 Current Coupon, Basis Live",
        lp: "Percentile: 7",
        lz: "Z-Score: -1",
        max: "Max: 2 on 06/03/2019",
        mean: "Mean: 2",
        min: "Min: 2 on 03/04/2018",
        sd: "Std. Dev.: 0"
      }
    ]
  }

  static propTypes = {
    textArr: PropTypes.arrayOf(
      PropTypes.shape({
        color: PropTypes.string,
        last: PropTypes.string,
        legend: PropTypes.string,
        lp: PropTypes.string,
        lz: PropTypes.string,
        max: PropTypes.string,
        mean: PropTypes.string,
        min: PropTypes.string,
        sd: PropTypes.string
      })
    ),
    lengendContainer: PropTypes.shape({
      boundary: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number
      }).isRequired
    }),
    positionInfo: PropTypes.shape({
      top: PropTypes.number,
      left: PropTypes.number,
      width: PropTypes.oneOf('auto', PropTypes.number),
      height: PropTypes.oneOf('auto', PropTypes.number)
    }),
    width: PropTypes.shape({
      legendWidth: PropTypes.oneOf('auto', PropTypes.number),
      statsWidth: PropTypes.oneOf('auto', PropTypes.number),
      lastTextWidth: PropTypes.oneOf('auto', PropTypes.number),
      minTextWidth: PropTypes.oneOf('auto', PropTypes.number),
      maxTextWidth: PropTypes.oneOf('auto', PropTypes.number),
      meanTextWidth: PropTypes.oneOf('auto', PropTypes.number),
      sdTextWidth: PropTypes.oneOf('auto', PropTypes.number),
      lzTextWidth: PropTypes.oneOf('auto', PropTypes.number),
      lpTextWidth: PropTypes.oneOf('auto', PropTypes.number)
    })
  }

  constructor(props) {
    super(props)

    this.state = this.props

    this.legend = createRef()
    this.dragEl = createRef()
    this.legendEl = createRef()
    this.closeLegend = this.closeLegend.bind(this)
    this.handleOnLegend = this.handleOnLegend.bind(this)
    this.formatLegendWidth = this.formatLegendWidth.bind(this)
    this.getElMaxMinWidth = this.getElMaxMinWidth.bind(this)
    this.container = document.createElement('div')
    this.container.className = 'legend__container'
  }

  componentWillUnMount() {
    this.container.removeChild(this.legend.current)
  }

  componentDidMount() {
    legendRoot.appendChild(this.container)

    setTimeout(() => {
      this.formatLegendWidth(this.state.textArr)
    }, 60);

  }

  closeLegend() {
    this.container.removeChild(this.legend.current)
  }

  handleOnLegend(e) {
    e.stopPropagation()

    let positionInfo = this.state.positionInfo,
      left = positionInfo.left,
      top = positionInfo.top,
      isDrag = e.currentTarget === this.dragEl.current,
      width = parseInt(/\d+/.exec(getComputedStyle(isDrag ? this.legend.current : e.currentTarget).width)),
      height = parseInt(/\d+/.exec(getComputedStyle(isDrag ? this.legend.current : e.currentTarget).height)),
      pageX = e.pageX,
      pageY = e.pageY,
      boundary = this.props.lengendContainer.boundary

    let handling = e => {
      e.stopPropagation()
      let curPageX = e.pageX,
        curPageY = e.pageY,
        diffLOW = curPageX - pageX,
        diffTOH = curPageY - pageY

      this.updateStyle(
        isDrag ? {
          top: top,
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
      )
    }

    let handleEnd = e => {
      document.removeEventListener('mousemove', handling)
      document.removeEventListener('mouseup', handleEnd)
      this.props.savePosInfo && this.props.savePosInfo(this.state.positionInfo)
    }

    document.addEventListener('mousemove', handling, false)
    document.addEventListener('mouseup', handleEnd, false)
  }

  updateStyle(newInfo) {
    this.setState({
      positionInfo: newInfo
    })
  }

  formatLegendWidth(textArr) {
    if (textArr.length) {
      let legend = [...document.getElementsByClassName('legend__content--text-legend')],
        statsBox = [...document.getElementsByClassName('legend__stats')],
        width = this.state.width,
        legendWidth = this.getElMaxMinWidth(legend) + 2,
        statsWidth

      this.setState({
        width: Object.assign({}, width, {
          "legendWidth": legendWidth
        })
      })
      let index = 0

      while (true) {
        let eles = statsBox.map(stats => {
          if (stats.getElementsByClassName('legend__stats--text')[index]) {
            return stats.getElementsByClassName('legend__stats--text')[index]
          }
        })

        if (!eles.length || eles.includes(undefined)) {
          break
        }

        let max = this.getElMaxMinWidth(eles),
          type = eles[0].getAttribute('data-type') + 'TextWidth'

        this.setState({
          width: Object.assign({}, width, {
            [`${type}`]: max + 4
          })
        })

        index += 1
      }

      statsWidth = this.getElMaxMinWidth(statsBox)

      this.setState({
        width: Object.assign({}, width, {
          statsWidth: statsWidth
        })
      })
    }
  }

  getElMaxMinWidth(element) {
    return Math.max(...element.map((ele, idx) => {
      let marginLeft = parseInt(/\d+/.exec(Utils.getTrueStyle(ele, 'marginLeft'))),
        marginRight = parseInt(/\d+/.exec(Utils.getTrueStyle(ele, 'marginRight'))),
        offsetWidth = ele.offsetWidth

      return marginLeft + offsetWidth + marginRight
    }))
  }

  render() {
    let { textArr, lengendContainer, className } = this.props,
      { positionInfo, width } = this.state

    return createPortal(
      <div className={cx('legend', className)} onMouseDown={this.handleOnLegend} ref={this.legend} style={{
        width: positionInfo.width,
        height: positionInfo.height,
        top: positionInfo.top,
        left: positionInfo.left,
        maxWidth: lengendContainer.boundary.width - positionInfo.left,
        maxHeight: lengendContainer.boundary.height - positionInfo.top
      }}>
        <div className='legend__close-icon' onClick={this.closeLegend}></div>
        <div className='legend__resize-icon' onMouseDown={this.handleOnLegend} ref={this.dragEl}></div>
        {
          textArr.map((option, index) => {
            return <div className='legend__content'>
              <span className='legend__content--rect' style={{
                backgroundColor: option.color
              }}></span>
              <span className='legend__content--text-legend' style={{
                width: width.legendWidth
              }}>
                {option.legend}
              </span>
              <div className='legend__stats' style={{
                width: width.statsWidth
              }}>
                <div className='legend__stats--text' data-type='last' style={{
                  width: width.lastTextWidth
                }}>
                  <span>{option.last && (option.last.split(':')[0] + (option.last ? ':' : ''))}</span>
                  <span>{option.last && (option.last.split(':').slice(1).join(':'))}</span>
                </div>
                <div className='legend__stats--text' data-type='min' style={{
                  width: width.minTextWidth
                }}>
                  <span>{option.min && (option.min.split(':')[0] + (option.min ? ':' : ''))}</span>
                  <span>{option.min && (option.min.split(':').slice(1).join(':'))}</span>
                </div>
                <div className='legend__stats--text' data-type='max' style={{
                  width: width.maxTextWidth
                }}>
                  <span>{option.max && (option.max.split(':')[0] + (option.max ? ':' : ''))}</span>
                  <span>{option.max && (option.max.split(':').slice(1).join(':'))}</span>
                </div>
                <div className='legend__stats--text' data-type='mean' style={{
                  width: width.meanTextWidth
                }}>
                  <span>{option.mean && (option.mean.split(':')[0] + (option.mean ? ':' : ''))}</span>
                  <span>{option.mean && (option.mean.split(':').slice(1).join(':'))}</span>
                </div>
                <div className='legend__stats--text' data-type='sd' style={{
                  width: width.sdTextWidth
                }}>
                  <span>{option.sd && (option.sd.split(':')[0] + (option.sd ? ':' : ''))}</span>
                  <span>{option.sd && (option.sd.split(':').slice(1).join(':'))}</span>
                </div>
                <div className='legend__stats--text' data-type='lz' style={{
                  width: width.lzTextWidth
                }}>
                  <span>{option.lz && (option.lz.split(':')[0] + (option.lz ? ':' : ''))}</span>
                  <span>{option.lz && (option.lz.split(':').slice(1).join(':'))}</span>
                </div>
                <div className='legend__stats--text' data-type='lp' style={{
                  width: width.lpTextWidth
                }}>
                  <span>{option.lp && (option.lp.split(':')[0] + (option.lp ? ':' : ''))}</span>
                  <span>{option.lp && (option.lp.split(':').slice(1).join(':'))}</span>
                </div>
              </div>
            </div>
          })
        }
      </div>, this.container)
  }
}

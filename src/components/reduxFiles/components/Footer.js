import React, { Component, PropTypes } from 'react'

export default class Footer extends Component {
    renderFilter(filter, name) {
        if (filter === this.props.filter) {
            return name
        }

        return (
            <a href='#' onClick={e => {
                e.preventDefault()
                this.props.onFilterChange(filter)
            }}
            style={{color:"#666"}}
            >
        {name}
      </a>
        )
    }

    render() {
        return (
            <p>
        <span style={{color:"#999",fontWeight:"bold",fontSize:"18px"}}>状态:</span>
        {' '}
        <span style={{fontSize:"14px",color:"#132a12"}}>{this.renderFilter('SHOW_ALL', '全部')}</span>
        {', '}
        <span style={{fontSize:"14px",color:"#132a12"}}>{this.renderFilter('SHOW_COMPLETED', '已完成')}</span>
        {', '}
       <span style={{fontSize:"14px",color:"#132a12"}}>{this.renderFilter('SHOW_ACTIVE', '未完成')}</span>
        .
      </p>
        )
    }
}

Footer.propTypes = {
    onFilterChange: PropTypes.func.isRequired,
    filter: PropTypes.oneOf([
        'SHOW_ALL',
        'SHOW_COMPLETED',
        'SHOW_ACTIVE'
    ]).isRequired
}
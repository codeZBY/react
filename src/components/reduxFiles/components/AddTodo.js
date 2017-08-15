import React, { Component, PropTypes } from 'react'

export default class AddTodo extends Component {
  render() {
    return (
      <div style={{padding:"4px 8px",textAline:"center"}}>
        <input type='text' ref='input' style={{height:20,lineHeight:"20px",backgroundColor:"#f0f0f0"}}/>
        <button onClick={(e) => this.handleClick(e)} style={{marginLeft:20,borderRadius:"4px",cursor:"pointer"}}>
          新增
        </button>
      </div>
    )
  }

  handleClick(e) {
    const node = this.refs.input
    const text = node.value.trim()
    if(text.length===0){
      alert('不能啥也不做')
    }else{
      this.props.onAddClick(text)
      node.value = ''
    }
   
  }
}

AddTodo.propTypes = {
  onAddClick: PropTypes.func.isRequired
}
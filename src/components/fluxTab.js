import React, { Component } from 'react'

class Fluxtab extends Component {
   constructor(props) {
     super(props);
     
     this.handelClick=this.handelClick.bind(this)
   }
   handelClick(e){
    let content=this.refs.content.value;
   }
    render() {
        return (
            <div>
              <textarea ref='content' ></textarea>
              <button onClick={this.handelClick}>submit</button>
              <div style={{marginTop:20}}>
                <label>data from reduxTab:</label>
                <p ref='fromRedux'></p>
              </div>
            </div>
        )
    }
}
export default Fluxtab
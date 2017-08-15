import React, { Component } from 'react';
import './App.css';
import { Link } from 'react-router'
class App extends Component {
    render() {
        return (
            <div >
     <div id='navBar'>
       <Link to='/fluxTab' activeStyle={{color:"#EE0000"}}>Flux</Link>
       <Link to='/reduxTab' activeStyle={{color:"#EE0000"}}>Redux</Link>
        </div>
        <div id='content'>
          {this.props.children}
      </div>
     </div>
        );
    }
}

export default App;

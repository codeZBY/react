import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import { Router, Route, hashHistory } from 'react-router'
import Fluxtab from './components/fluxTab'
import ReduxTab from './components/reduxTab'
ReactDOM.render(
    <Router history={hashHistory}>
        <Route path="/" component={App}>
          <Route path="/fluxTab" component={Fluxtab}></Route>
          <Route path="/reduxTab" component={ReduxTab}></Route>
        </Route>
    </Router>,
    document.getElementById('root')
);

import React,{Component} from 'react'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import todoApp from './reduxFiles/reducer'
import App from './reduxFiles/containers/App'
let store = createStore(todoApp)
class ReduxTab extends Component {
    render() {
        return (
            <Provider store={store}>
              <App />
            </Provider>
        )
    }
}

export default ReduxTab

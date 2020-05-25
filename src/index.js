import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

import Success from './pages/Success';
import Terms from './pages/Terms';
import Connect from './pages/Connect';

ReactDOM.render(
  <Router>
    <Switch>
      <Route path="/success">
        <Success />
      </Route>
      <Route path="/terms">
        <Terms />
      </Route>
      <Route path="/connect">
        <Connect />
      </Route>
      <Route path="/">
        <App />
      </Route>
    </Switch>
  </Router>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

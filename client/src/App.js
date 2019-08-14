import React, { Component, Fragment } from "react";
import { Route, BrowserRouter as Router } from "react-router-dom";

import AnnotationApp from "./AnnotationApp";
import AdminApp from "./AdminApp";
import LoginPage from "./LoginPage";

class App extends Component {
  render() {
    return (
      <Router>
        <Fragment>
          <Route exact path="/admin" component={AdminApp} />
          <Route exact path="/" component={AnnotationApp} />
          <Route path="/admin/login" component={LoginPage} />
        </Fragment>
      </Router>
    );
  }
}

export default App;

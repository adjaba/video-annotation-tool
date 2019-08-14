import React, { Component, Fragment } from "react";
import { Route, BrowserRouter as Router } from "react-router-dom";

import AnnotationApp from "./AnnotationApp";
import AdminApp from "./AdminApp";
// import FPSpage from "./FPSpage";

class App extends Component {
  render() {
    return (
      <Router>
        <Fragment>
          <Route path="/admin" component={AdminApp} />
          <Route exact path="/" component={AnnotationApp} />
          <Route path='/fps'render={() => {window.location.href="/html/index.html"}}/>
        </Fragment>
      </Router>
    );
  }
}

export default App;

import React, { Component } from "react";

import "./AdminApp.css";

import {
  Header,
  Segment,
  Table,
  Button,
  Icon,
  Checkbox,
  Input,
  Form
} from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";

export default class AdminEdit extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Form>
        <Form.Input
          value={this.props.name}
          onChange={function(e, { value }) {
            this.props.rename(this.props.id, value, this.props.mode);
          }}
          style={{ opacity: 1 }}
        ></Form.Input>
      </Form>
    );
  }
}

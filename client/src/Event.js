import React, { Component } from "react";
import PropTypes from "prop-types";
import { events, scenes, actions } from "./utils";
import { Header, List, Button, Label } from "semantic-ui-react";

export default class Event extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      index,
      segment,
      labelEvent,
      numberOfActions,
      labelActionIndex,
      numberOfScenes,
      labelScenes,
      style,
      onClick
    } = this.props;

    return (
      <List.Item>
        <div
          style={{
            flex: 1,
            padding: "5px",
            fontSize: "1.3em",
            ...style
          }}
          onClick={onClick}
        >
          <Header size="small" style={{ flex: "0 0 auto" }}>
            <Label color="red" circular>
              {index}
            </Label>
          </Header>
          {labelEvent}
          Segment is {segment} . labelEvent {labelEvent} . numberOfActions{" "}
          {numberOfActions} . labelActionIndex {labelActionIndex} .
          numberOfScenes {numberOfScenes} . labelScenes {labelScenes} .
          {/* <List divided selection style = {{ flex: 1, overflowY: 'auto'}}>

                  </List> */}
        </div>
      </List.Item>
    );
  }
}

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
            flex: "0 0 auto",
            padding: "5px",
            fontSize: "1.3em",
            ...style
          }}
          onClick={onClick}
        >
          <Header size="small" style={{ display: "block" }}>
            <Label color="red" circular>
              {index}
            </Label>
            {labelEvent}
          </Header>
          Start: {segment[0]} End: {segment[1]}
          {/* Segment is {segment} . labelEvent {labelEvent} . numberOfActions{" "}
          {numberOfActions} . labelActionIndex {labelActionIndex} .
          numberOfScenes {numberOfScenes} . labelScenes {labelScenes} . */}
          {/* <List divided selection style = {{ flex: 1, overflowY: 'auto'}}>

                  </List> */}
        </div>
      </List.Item>
    );
  }
}

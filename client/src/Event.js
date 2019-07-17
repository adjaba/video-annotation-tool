import React, { Component } from "react";
import PropTypes from "prop-types";
import { events, scenes, actions } from "./utils";
import { Header, List, Button } from "semantic-ui-react";

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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "1em 0.5em",
          borderRight: "1px solid #ccc",
          height: "100%",
          ...style
        }}
        onClick={onClick}
      >
        <Header size="small" style={{ flex: "0 0 auto" }}>
          {index}
        </Header>
        Segment is {segment} . labelEvent {labelEvent} . numberOfActions{" "}
        {numberOfActions} . labelActionIndex {labelActionIndex} . numberOfScenes{" "}
        {numberOfScenes} . labelScenes {labelScenes} .
        {/* <List divided selection style = {{ flex: 1, overflowY: 'auto'}}>

                </List> */}
      </div>
    );
  }
}

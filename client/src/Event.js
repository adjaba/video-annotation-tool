import React, { Component } from "react";
import PropTypes from "prop-types";
import { events, scenes, actions } from "./utils";
import { Header, List, Button, Label, Icon } from "semantic-ui-react";

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
      onClick,
      onDeleteClick,
      focus
    } = this.props;

    return (
      <List.Item style={{ backgroundColor: index === focus ? "#eee" : "#fff" }}>
        <div
          style={{
            flex: "0 0 auto",
            margin: "5px",
            fontSize: "1.3em",
            ...style
          }}
          onClick={onClick}
        >
          <div style={{ display: "flex", width: "100%" }}>
            <Header size="small" floated="left">
              <Label color="blue" circular>
                {index}
              </Label>
              {labelEvent}
            </Header>
            <div style={{ flex: 1 }} />
            <Button
              icon="remove circle"
              color="red"
              size="medium"
              compact
              onClick={this.props.onDeleteClick}
              style={{ marginRight: 0, fontSize: "10px" }}
            />
          </div>
          <div style={{ display: "block" }}>
            Start Frame: {segment[0]} <br /> End Frame: {segment[1]}
          </div>
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

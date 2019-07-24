import React, { Component } from "react";
import Sortable from "react-sortablejs";
import { scenes, actions } from "./utils";
import { Icon, Header } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";

export default class ScenesActions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      items: this.props.items.map(item => item.toLowerCase())
    };
  }
  // state = {
  //   items: []
  // };

  render() {
    var pool =
      this.props.mode === "scenes"
        ? Object.keys(scenes)
        : this.props.mode === "actions"
        ? Object.keys(actions)
        : null;
    const source = pool.map((val, key) => (
      <li key={key} data-id={val}>
        {val}
      </li>
    ));

    // var width = this.props.mode === ""
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          overflowY: "auto",
          padding: "5px"
        }}
      >
        <div className="col-sm-6">
          <Header size="small">
            {this.props.mode.charAt(0).toUpperCase() + this.props.mode.slice(1)}
          </Header>
          <Sortable
            options={{
              animation: 150,
              sort: true,
              group: {
                name: "clone1",
                pull: false,
                put: true
              }
            }}
            className="block-list"
            tag="ul"
            onChange={(order, sortable, evt) => this.setState({ items: order })}
          >
            {this.state.items.map((val, key) => (
              <li key={key} data-id={val}>
                {val}
                <Icon
                  className="deletecursor"
                  name="delete"
                  style={{ float: "right" }}
                  onClick={() => {
                    const items = this.state.items;
                    console.log("deleting ", val, key, "from ", items);
                    items.splice(key, 1);
                    this.setState({
                      items: items
                    });
                  }}
                ></Icon>
              </li>
            ))}
          </Sortable>
        </div>
        <div className="col-sm-6">
          <Sortable
            options={{
              animation: 150,
              sort: false,
              group: {
                name: "clone1",
                pull: "clone",
                put: false
              }
            }}
            className="block-list"
            tag="ul"
          >
            {source}
          </Sortable>
        </div>
      </div>
    );
  }
}

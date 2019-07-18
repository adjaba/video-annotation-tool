import React, { Component } from "react";
import Sortable from "react-sortablejs";
import { scenes, actions } from "./utils";
import { Icon } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";

export default class ScenesActions extends React.Component {
  state = {
    items: []
  };

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
    return (
      <div style={{ display: "flex", flexDirection: "row" }}>
        <div className="col-sm-6">
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

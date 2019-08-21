import React, { Component } from "react";
import PropTypes from "prop-types";
import Sortable from "react-sortablejs";
import { Icon, Header, Input } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";

export default class ScenesActions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      source: this.props.source, // this is the state of the options pool, changes based on search input
      trigger: false
    };
  }

  componentWillUnmount() {
    // if (this.props.items.length=== 0 && this.props.index !== null){
    //   alert("You have not put any "+ this.props.mode+".");
    // }
  }
  render() {
    var pool = Object.values(this.props.source); // this is the constant pool to filter upon, for options pool filtering

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          padding: "5px",
          ...this.props.style,
          minHeight: 0
        }}
      >
        <div
          className="col-sm-6"
          style={{ flexDirection: "column", display: "flex" }}
        >
          <Header size="small" style={{ height: "30px", flex: 0 }}>
            {this.props.mode.charAt(0).toUpperCase() + this.props.mode.slice(1)}
          </Header>
          <div style={{ overflowY: "auto" }}>
            <Sortable
              options={{
                animation: 150,
                sort: true,
                group: {
                  name: "clone1" + this.props.mode,
                  pull: false,
                  put: true
                }
              }}
              className="block-list unfixed"
              tag="ul"
              onChange={(order, sortable, evt) => {
                this.props.onChange(order, this.props.mode);
              }}
            >
              {this.props.items.map((idx, key) => (
                <li key={key} data-id={idx}>
                  <div style={{ display: "flex" }}>
                    <div style={{ flex: 1 }}>{this.props.sourceall[idx]}</div>
                    <div style={{ flex: 0 }}>
                      <Icon
                        className="deletecursor"
                        name="delete"
                        style={{ float: "right" }}
                        onClick={() => {
                          const items = this.props.items;
                          items.splice(key, 1);
                          this.props.onChange(items, this.props.mode);
                        }}
                      ></Icon>
                    </div>
                  </div>
                </li>
              ))}
            </Sortable>
          </div>
        </div>
        <div
          style={{ flexDirection: "column", display: "flex" }}
          className="col-sm-6"
        >
          <Input
            fluid
            style={{ margin: "0px 0px 5px 0px" }}
            placeholder={"Search " + this.props.mode}
            onChange={e => {
              var trigger = this.state.trigger;
              this.setState({
                source: pool.filter(item => {
                  return (
                    item.toLowerCase().indexOf(e.target.value.toLowerCase()) >=
                    0
                  );
                }),
                trigger: !trigger
              });
            }}
          />
          <div style={{ overflowY: "auto" }}>
            <Sortable
              key={this.state.trigger}
              options={{
                animation: 150,
                sort: false,
                group: {
                  name: "clone1" + this.props.mode,
                  pull: "clone" + this.props.mode,
                  put: false
                }
              }}
              className="block-list"
              tag="ul"
            >
              {Object.keys(this.state.source).map((idx, key) => (
                <li key={key} data-id={idx}>
                  <div style={{ display: "flex" }}>
                    <div style={{ flex: 1 }}>{this.state.source[idx]}</div>
                  </div>
                </li>
              ))}
            </Sortable>
          </div>
        </div>
      </div>
    );
  }
}

ScenesActions.propTypes = {
  mode: PropTypes.oneOf(["scenes", "actions"]),
  items: PropTypes.arrayOf(PropTypes.number),
  source: PropTypes.objectOf(PropTypes.string) // {idx: scene/action}
};

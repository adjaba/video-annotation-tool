import React, { Component } from "react";
import { Switch, Route, Link } from "react-router-dom";

import "./AdminApp.css";

import { Header, Segment, Table, Button, Checkbox } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";

class AdminApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      videos: null,
      events: null,
      scenes: null,
      actions: null
    };
  }

  componentDidMount() {
    this.reload();
  }

  async reload() {
    console.log("HEY");
    try {
      const videos = await (await fetch("/api/videos/")).json();
      console.log("SUCCESS", videos);
      this.setState({
        videos: videos["message"]
      });
    } catch (error) {
      console.log(error, "OH NO");
    }
    try {
      const events = await (await fetch("/api/events/")).json();
      console.log("SUCCESS", events);
      this.setState({
        events: events["message"]
      });
    } catch (error) {
      console.log(error, "OH NO");
    }
    try {
      const scenes = await (await fetch("/api/scenes/")).json();
      console.log("SUCCESS scene", scenes);
      this.setState({
        scenes: scenes["message"]
      });
    } catch (error) {
      console.log(error, "OH NO");
    }
    try {
      const actions = await (await fetch("/api/actions/")).json();
      console.log("SUCCESS", actions);
      this.setState({
        actions: actions["message"]
      });
    } catch (error) {
      console.log(error, "OH NO");
    }
  }

  convertTimestamp(timestamp) {
    var d = new Date(timestamp);
    var year = d.getFullYear(),
      mo = ("0" + (d.getMonth() + 1)).slice(-2),
      day = ("0" + d.getDate()).slice(-2),
      h = d.getHours(),
      min = ("0" + d.getMinutes()).slice(-2);
    return year + "/" + mo + "/" + day + " " + h + ":" + min;
  }

  async toggleDelete(mode, id) {
    console.log(mode, id, "toggleDelete");
    if (mode === "events" || mode === "scenes" || mode === "actions") {
      await (await fetch("/api/" + mode + "/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id
        })
      }))
        .json()
        .then(message => {
          console.log(message);
        });
    }
    this.reload();
  }
  render() {
    const { videos, events, scenes, actions } = this.state;
    return (
      <div style={{ width: "1200px" }}>
        <Header disabled>Admin Page</Header>
        <Link to="/">
          <Button>Annotate</Button>
        </Link>
        <Segment>
          <Table celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Event Name</Table.HeaderCell>
                <Table.HeaderCell>Index</Table.HeaderCell>
                <Table.HeaderCell>Deleted</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {(events || []).map(({ id, eventName, deleted }) => (
                <Table.Row
                  key={id}
                  style={{ backgroundColor: !!+deleted ? "#ddd" : "#fff" }}
                >
                  <Table.Cell>{eventName}</Table.Cell>
                  <Table.Cell>{id}</Table.Cell>
                  <Table.Cell>
                    <Checkbox
                      checked={!!+deleted}
                      onChange={() => this.toggleDelete("events", id)}
                    ></Checkbox>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
          <Table celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Scene Name</Table.HeaderCell>
                <Table.HeaderCell>Index</Table.HeaderCell>
                <Table.HeaderCell>Deleted</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {(scenes || []).map(({ id, sceneName, deleted }) => (
                <Table.Row
                  key={id}
                  style={{ backgroundColor: !!+deleted ? "#ddd" : "#fff" }}
                >
                  <Table.Cell>{sceneName}</Table.Cell>
                  <Table.Cell>{id}</Table.Cell>
                  <Table.Cell>
                    <Checkbox
                      checked={!!+deleted}
                      onChange={() => this.toggleDelete("scenes", id)}
                    ></Checkbox>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
          <Table celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Action Name</Table.HeaderCell>
                <Table.HeaderCell>Index</Table.HeaderCell>
                <Table.HeaderCell>Deleted</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {(actions || []).map(({ id, actionName, deleted }) => (
                <Table.Row
                  key={id}
                  style={{ backgroundColor: !!+deleted ? "#ddd" : "#fff" }}
                >
                  <Table.Cell>{actionName}</Table.Cell>
                  <Table.Cell>{id}</Table.Cell>
                  <Table.Cell>
                    <Checkbox
                      checked={!!+deleted}
                      onChange={() => this.toggleDelete("actions", id)}
                    ></Checkbox>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Segment>
        <Segment>
          <Table celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Video Name</Table.HeaderCell>
                <Table.HeaderCell>JSON</Table.HeaderCell>
                <Table.HeaderCell>Last Edited</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {(videos || []).map(
                ({ currentJson, id, lastEdited, videoName }) => (
                  <Table.Row key={id}>
                    <Table.Cell>{videoName}</Table.Cell>
                    <Table.Cell>
                      {JSON.stringify(
                        currentJson["history"][
                          currentJson["history"].length -
                            1 -
                            currentJson["historyIndex"]
                        ][0]
                      )}
                    </Table.Cell>
                    <Table.Cell>{this.convertTimestamp(lastEdited)}</Table.Cell>
                  </Table.Row>
                )
              )}
            </Table.Body>
          </Table>
        </Segment>
      </div>
    );
  }
}

export default AdminApp;

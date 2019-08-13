import React, { Component } from "react";
import { Switch, Route, Link } from "react-router-dom";

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

const mapping = {
  events: "newEvent",
  actions: "newAction",
  scenes: "newScene"
};

class AdminApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      videos: null,
      events: null,
      scenes: null,
      actions: null,
      newEvent: null,
      newScene: null,
      newAction: null,
      editableEvents: false,
      editableScenes: false,
      editableActions: false,
      hiddenEvents: false
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

  async onSubmit(e, mode) {
    e.preventDefault();
    const form = e.target;

    if (mode === "events" || mode === "scenes" || mode === "actions") {
      await (await fetch("/api/" + mode + "/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: this.state[mapping[mode]]
        })
      })).json();

      form.reset();
      this.reload();
    }
  }
  async toggleDelete(mode, id) {
    if (mode === "events" || mode === "scenes" || mode === "actions") {
      await (await fetch("/api/" + mode + "/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id
        })
      })).json();
    }
    this.reload();
  }

  async rename(id, newName, mode) {
    if (mode === "events" || mode === "scenes" || mode === "actions") {
      await (await fetch("/api/" + mode + "/rename", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id,
          newName
        })
      })).json();
    }
    this.reload();
  }

  render() {
    const { videos, events, scenes, actions } = this.state;
    return (
      <div
        style={{ maxWidth: "1200px", marginLeft: "auto", marginRight: "auto" }}
      >
        <Header disabled>Admin Page</Header>
        <Link to="/">
          <Button>Annotate</Button>
        </Link>
        <Segment>
          <Header>
            <Icon
              name={this.state.hiddenEvents ? "angle right" : "angle down"}
              onClick={() =>
                this.setState({ hiddenEvents: !this.state.hiddenEvents })
              }
            ></Icon>
            Events{" "}
          </Header>
          <div hidden={this.state.hiddenEvents}>
            <Button
              icon={this.state.editableEvents ? "lock" : "unlock"}
              content={this.state.editableEvents ? "Lock" : "Make Edits"}
              onClick={() =>
                this.setState({ editableEvents: !this.state.editableEvents })
              }
            ></Button>
            {/* TODO: Hide deleted?? <Button icon='eye' labelPosition='left' content="Show All"></Button> */}
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
                    <Table.Cell>
                      <Input
                        transparent={!this.state.editableEvents}
                        disabled={!this.state.editableEvents}
                        value={eventName}
                        onChange={(e, { value }) => {
                          this.rename(id, value, "events");
                        }}
                        style={{ opacity: 1 }}
                      ></Input>
                    </Table.Cell>
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
            <Header disabled> Add a new event </Header>
            <Form
              style={{ maxWidth: 600 }}
              onSubmit={e => this.onSubmit(e, "events")}
            >
              <Form.Input
                label="Event Name:"
                onChange={(e, { value }) => this.setState({ newEvent: value })}
              ></Form.Input>
              <Button type="submit">Add</Button>
            </Form>
          </div>
        </Segment>
        <Segment>
          <Header>Scenes</Header>
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
                  <Table.Cell>
                    <Input
                      transparent
                      value={sceneName}
                      onChange={(e, { value }) => {
                        this.rename(id, value, "events");
                      }}
                    ></Input>
                  </Table.Cell>
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
          <Header disabled> Add a new scene </Header>
          <Form
            style={{ maxWidth: 600 }}
            onSubmit={e => this.onSubmit(e, "scenes")}
          >
            <Form.Input
              label="Scene Name:"
              onChange={(e, { value }) => this.setState({ newScene: value })}
            ></Form.Input>
            <Button type="submit">Add</Button>
          </Form>
        </Segment>
        <Segment>
          <Header>Actions</Header>
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
                  <Table.Cell>
                    <Input
                      value={actionName}
                      onChange={(e, { value }) => {
                        this.rename(id, value, "events");
                      }}
                    ></Input>
                  </Table.Cell>
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
          <Header disabled> Add a new action </Header>
          <Form
            style={{ maxWidth: 600 }}
            onSubmit={e => this.onSubmit(e, "actions")}
          >
            <Form.Input
              label="Action Name:"
              onChange={(e, { value }) => this.setState({ newAction: value })}
            ></Form.Input>
            <Button type="submit">Add</Button>
          </Form>
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

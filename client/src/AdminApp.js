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

const newMapping = {
  events: "newEvent",
  actions: "newAction",
  scenes: "newScene"
};

const renameMapping = {
  events: "eventsRename",
  action: "actionsRename",
  scenes: "scenesRename"
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
      hiddenEvents: false,
      hiddenScenes: false,
      hiddenActions: false,
      eventsRename: {},
      scenesRename: {},
      actionsRename: {}
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
          name: this.state[newMapping[mode]]
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
      this.reload();
    }
  }

  async batchRename(mode) {
    if (mode === "events" || mode === "scenes" || mode === "actions") {
      await (await fetch("/api/" + mode + "/rename-bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ renames: this.state[renameMapping[mode]] })
      })).json();
      this.setState({
        [renameMapping[mode]]: {}
      });
      this.reload();
    }
  }

  renderEventSceneAction() {
    var modes = ["events", "scenes", "actions"];
    var capitalizedMode = mode => mode.charAt(0).toUpperCase() + mode.slice(1);
    var hideToggle = mode => "hidden" + capitalizedMode(mode);
    var editToggle = mode => "editable" + capitalizedMode(mode);
    var renameList = mode => mode + "Rename";
    var entryName = mode => mode.slice(0, -1) + "Name";

    return modes.map(mode => (
      <Segment>
        <Header className={this.state[hideToggle(mode)] ? "collapsed" : ""}>
          <Icon
            name={this.state[hideToggle(mode)] ? "angle right" : "angle down"}
            onClick={() =>
              this.setState({
                [hideToggle(mode)]: !this.state[hideToggle(mode)]
              })
            }
          ></Icon>
          {capitalizedMode(mode)}{" "}
        </Header>
        <div hidden={this.state[hideToggle(mode)]}>
          <Button
            icon={this.state[editToggle(mode)] ? "lock" : "unlock"}
            content={this.state[editToggle(mode)] ? "Lock" : "Make Edits"}
            onClick={() =>
              this.setState({
                [editToggle(mode)]: !this.state[editToggle(mode)]
              })
            }
          ></Button>
          <Button
            icon="save"
            disabled={Object.keys(this.state[renameList(mode)]).length === 0}
            onClick={() => this.batchRename(mode)}
            content="Apply name changes"
          ></Button>
          <Table celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell>Index</Table.HeaderCell>
                <Table.HeaderCell>Deleted</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {(this.state[mode] || []).map(
                ({ id, [entryName(mode)]: name, deleted }, i) => (
                  <Table.Row
                    key={id}
                    style={{ backgroundColor: !!+deleted ? "#ddd" : "#fff" }}
                  >
                    <Table.Cell>
                      <Input
                        transparent={!this.state[editToggle(mode)]}
                        disabled={!this.state[editToggle(mode)]}
                        value={name}
                        onChange={(e, { value }) => {
                          var renameChanges = this.state[renameList(mode)];
                          var entries = this.state[mode];
                          entries[i][entryName(mode)] = value;

                          renameChanges[id] = value;
                          this.setState({
                            [renameList(mode)]: renameChanges,
                            [mode]: entries
                          });
                        }}
                        style={{ opacity: 1 }}
                      ></Input>
                    </Table.Cell>
                    <Table.Cell>{id}</Table.Cell>
                    <Table.Cell>
                      <Checkbox
                        disabled={!this.state[editToggle(mode)]}
                        checked={!!+deleted}
                        onChange={() => this.toggleDelete(mode, id)}
                      ></Checkbox>
                    </Table.Cell>
                  </Table.Row>
                )
              )}
            </Table.Body>
          </Table>
          <Header disabled> Add a new {mode.slice(0, -1)} </Header>
          <Form
            style={{ maxWidth: 600 }}
            onSubmit={e => this.onSubmit(e, mode)}
          >
            <Form.Input
              label={capitalizedMode(mode).slice(0, -1) + " Name:"}
              onChange={(e, { value }) =>
                this.setState({
                  ["new" + capitalizedMode(mode).slice(0, -1)]: value
                })
              }
            ></Form.Input>
            <Button type="submit">Add</Button>
          </Form>
        </div>
      </Segment>
    ));
  }
  render() {
    const { videos } = this.state;
    return (
      <div
        style={{ maxWidth: "1200px", marginLeft: "auto", marginRight: "auto" }}
      >
        <Header disabled>Admin Page</Header>
        <Link to="/">
          <Button>Annotate</Button>
        </Link>
        {this.renderEventSceneAction()}
        {/* <Segment>
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
            <Button
              icon="save"
              disabled={Object.keys(this.state.eventsRename).length === 0}
              onClick={() => this.batchRename("events")}
              content="Apply name changes"
            ></Button>
            <Table celled>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Event Name</Table.HeaderCell>
                  <Table.HeaderCell>Index</Table.HeaderCell>
                  <Table.HeaderCell>Deleted</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {(events || []).map(({ id, eventName, deleted }, i) => (
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
                          var eventsRename = this.state.eventsRename;
                          var events = this.state.events;
                          events[i]["eventName"] = value;

                          eventsRename[id] = value;
                          this.setState({
                            eventsRename,
                            events
                          });
                        }}
                        style={{ opacity: 1 }}
                      ></Input>
                    </Table.Cell>
                    <Table.Cell>{id}</Table.Cell>
                    <Table.Cell>
                      <Checkbox
                        disabled={!this.state.editableEvents}
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
        <Header>
            <Icon
              name={this.state.hiddenScenes ? "angle right" : "angle down"}
              onClick={() =>
                this.setState({ hiddenScenes: !this.state.hiddenScenes })
              }
            ></Icon>
            Scenes{" "}
          </Header>
          <div hidden={this.state.hiddenScenes}>
            <Button
              icon={this.state.editableScenes ? "lock" : "unlock"}
              content={this.state.editableScenes ? "Lock" : "Make Edits"}
              onClick={() =>
                this.setState({ editableScenes: !this.state.editableScenes })
              }
            ></Button>
            <Button
              icon="save"
              disabled={Object.keys(this.state.scenesRename).length === 0}
              onClick={() => this.batchRename("scenes")}
              content="Apply name changes"
            ></Button>
            <Table celled>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Scene Name</Table.HeaderCell>
                  <Table.HeaderCell>Index</Table.HeaderCell>
                  <Table.HeaderCell>Deleted</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {(scenes || []).map(({ id, sceneName, deleted , i}) => (
                  <Table.Row
                    key={id}
                    style={{ backgroundColor: !!+deleted ? "#ddd" : "#fff" }}
                  >
                    <Table.Cell>
                      <Input
                        transparent={!this.state.editableScenes}
                        disabled={!this.state.editableScenes}
                        value={sceneName}
                        onChange={(e, { value }) => {
                          var scenesRename = this.state.scenesRename;
                          var scenes = this.state.scenes;
                          scenes[i]["sceneName"] = value;

                          scenesRename[id] = value;
                          this.setState({
                            scenesRename,
                            scenes
                          });
                        }}
                        style={{ opacity: 1 }}
                      ></Input>
                    </Table.Cell>
                    <Table.Cell>{id}</Table.Cell>
                    <Table.Cell>
                      <Checkbox
                        disabled={!this.state.editableScenes}
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
          </div>
        </Segment>
        <Segment>
          <Header>Actions</Header>
          <div hidden={this.state.hiddenActions}>
            <Button
              icon={this.state.editableActions ? "lock" : "unlock"}
              content={this.state.editableActions ? "Lock" : "Make Edits"}
              onClick={() =>
                this.setState({ editableActions: !this.state.editableActions })
              }
            ></Button>
            <Button
              icon="save"
              disabled={Object.keys(this.state.actionsRename).length === 0}
              onClick={() => this.batchRename("actions")}
              content="Apply name changes"
            ></Button>
            <Table celled>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Action Name</Table.HeaderCell>
                  <Table.HeaderCell>Index</Table.HeaderCell>
                  <Table.HeaderCell>Deleted</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {(actions || []).map(({ id, actionName, deleted }, i) => (
                  <Table.Row
                    key={id}
                    style={{ backgroundColor: !!+deleted ? "#ddd" : "#fff" }}
                  >
                    <Table.Cell>
                      <Input
                        transparent={!this.state.editableActions}
                        disabled={!this.state.editableActions}
                        value={actionName}
                        onChange={(e, { value }) => {
                          var actionsRename = this.state.actionsRename;
                          var actions = this.state.actions;
                          actions[i]["actionName"] = value;

                          actionsRename[id] = value;
                          this.setState({
                            actionsRename,
                            actions
                          });
                        }}
                        style={{ opacity: 1 }}
                      ></Input>
                    </Table.Cell>
                    <Table.Cell>{id}</Table.Cell>
                    <Table.Cell>
                      <Checkbox
                        disabled={!this.state.editableActions}
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
          </div>
        </Segment> */}
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

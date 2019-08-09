import React, { Component } from "react";
import { Switch, Route, Link } from "react-router-dom";

import "./AdminApp.css";

import { Header, Segment, Table, Button } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";

class AdminApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      videos: null
    };
  }

  componentDidMount() {
    this.reload();
  }

  async reload() {
    console.log("HEY");
    try {
      const videos = await (await fetch("/api/videos")).json();
      console.log("SUCCESS", videos);
      this.setState({
        videos: videos["message"]
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

  render() {
    const { videos } = this.state;
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

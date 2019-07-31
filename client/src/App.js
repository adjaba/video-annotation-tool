import React, { Component } from "react";
import "./App.css";
import VideoPlayer from "./VideoPlayer";
import "video.js/dist/video-js.css";
import videojs from "video.js";
import Event from "./Event";
import VideoPreview from "./VideoPreview";
import { frameToSecs, secsToFrame, scenes, events, actions } from "./utils";
import ScenesActions from "./ScenesActions";
import update from "immutability-helper";
import { Hotkeys, GlobalHotKeys } from "react-hotkeys";

import {
  Header,
  Form,
  Button,
  Icon,
  List,
  Grid,
  Dimmer,
  Segment,
  Dropdown
} from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";

import uniqueId from "lodash/uniqueId";
import { EventEmitter } from "events";
import { isThisSecond } from "date-fns";
import { callbackify } from "util";

// (function localFileVideoPlayer() {
// 	'use strict'
//   var URL = window.URL || window.webkitURL
//   var displayMessage = function (message, isError) {
//     var element = document.querySelector('#message')
//     element.innerHTML = message
//     element.className = isError ? 'error' : 'info'
//   }
//   var playSelectedFile = function (event) {
//     var file = this.files[0]
//     var type = file.type
//     var videoNode = document.querySelector('video')
//     var canPlay = videoNode.canPlayType(type)
//     if (canPlay === '') canPlay = 'no'
//     var message = 'Can play type "' + type + '": ' + canPlay
//     var isError = canPlay === 'no'
//     displayMessage(message, isError)

//     if (isError) {
//       return
//     }

//     var fileURL = URL.createObjectURL(file)
//     videoNode.src = fileURL
//   }
//   var inputNode = document.getElementById('input')
//   inputNode.addEventListener('change', playSelectedFile, false)
// })()

var URL = window.URL || window.webkitURL;

var videoJsOptions = {
  autoplay: true,
  controls: true,
  preload: "none",
  height: 400
};

var videoPreviewOptions = {
  autoplay: false,
  preload: "auto",
  height: 200
};

const keyMap = {
  UNDO: "ctrl+z",
  REDO: ["ctrl+y", "shift+ctrl+z"]
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      videoName: null,
      saved: true,
      videoSrc: null,
      json: null,
      jsonName: null,
      history: [],
      historyIndex: 0,
      segmentStart: null,
      segmentEnd: null,
      segmentIndex: null,
      segmentEvent: null,
      segmentScenes: [],
      segmentActions: [],
      videoEndSecs: 0,
      visibleMenu: false
    };
    this.playSelectedFile = this.playSelectedFile.bind(this);
    this.jumpTo = this.jumpTo.bind(this);
    this.parseJSONInput = this.parseJSONInput.bind(this);
    // this.frameToSecs = this.frameToSecs.bind(this);
    this.playSection = this.playSection.bind(this);
    this.videoPreviewChange = this.videoPreviewChange.bind(this);
    this.export = this.export.bind(this);
    this.setScenesActions = this.setScenesActions.bind(this);
    this.setEvent = this.setEvent.bind(this);
    this.undo = this.undo.bind(this);
    this.redo = this.redo.bind(this);
    this.addEvent = this.addEvent.bind(this);
  }

  handlers = {
    UNDO: () => this.undo(),
    REDO: () => this.redo()
  };

  componentDidUpdate(prevProps, prevState) {
    const videoNameJSONUpdated =
      prevState["videoName"] !== this.state.videoName ||
      prevState["json"] !== this.state.json;
    // if video or json updated
    if (videoNameJSONUpdated) {
      // if video and json exists
      if (this.state.videoName && this.state.json) {
        // if video and json match
        console.log("json and video present and change detected");
        if (
          Object.keys(this.state.json["database"]).indexOf(
            this.state.videoName
          ) >= 0
        ) {
          console.log("initializing");
          console.log(
            "fps ",
            this.state.json["database"][this.state.videoName]["fps"]
          );
          this.setState({
            saved: true,
            visibleMenu: true,
            history: [
              [
                this.state.json["database"][this.state.videoName],
                this.state.segmentIndex
              ]
            ]
          });
        } else {
          this.setState({
            videoEndSecs: null,
            segmentIndex: null,
            history: []
          });
          alert(
            "Upload a video with the correct filename or upload the correct json file."
          );
        }
      } else {
        this.setState({
          videoEndSecs: null,
          segmentIndex: null,
          history: []
        });
      }
    }
  }

  // on video upload
  playSelectedFile(event) {
    var file = event.target.files[0];
    const player = videojs.getPlayer("videoJS");

    if (!file) {
      this.setState({
        videoName: null,
        videoSrc: null,
        segmentIndex: null,
        videoEndSecs: null
      });
      player.reset();
      return;
    }

    // // if input changed but there was a previous videoSrc
    // // TODO: generate unique segmentIndex per new upload of video, just to reset videopreview and list
    // if (this.state.videoSrc) {
    //   // segmentIndex = this.state.segmentIndex + '0';
    // }

    if (player.canPlayType(file.type) === "") {
      alert(
        "Cannot play video with type " +
          file.type +
          ", please select a different video or use a different browser."
      );
      return;
    }

    var fileURL = URL.createObjectURL(file);
    player.src({
      src: fileURL,
      type: file.type
    });

    // const playerStart = videojs.getPlayer("videoJSStart");
    // playerStart.src({
    //   src: fileURL,
    //   type: file.type
    // });
    this.setState({
      videoName: file.name.substring(0, file.name.lastIndexOf(".")),
      videoSrc: {
        src: fileURL,
        type: file.type
      },
      segmentIndex: null
    });

    player.on("loadedmetadata", () => {
      this.setState({
        videoEndSecs: player.duration()
      });
    });
    // console.log(videojs.getPlayer("videoJSEnd"));
  }

  parseJSONInput(event) {
    if (!event.target.files[0]) {
      // this.setState({
      //   json: null
      // });
      return;
    }

    var reader = new FileReader();
    reader.onload = event => {
      var json = JSON.parse(event.target.result);
      // TODO: add more to ensure correct formatting (ex: annotations)
      if (!("database" in json)) {
        alert("Wrong format, please upload new json.");
        var jsonUpload = document.getElementById("input_json");
        jsonUpload.click();
        return;
      }
      this.setState({
        json: json
      });
    };
    // } function(event){
    //   console.log(JSON.parse(event.target.result)['database']);
    //   this.setState({
    //     metadata: JSON.parse(event.target.result)['database'],
    //   })
    // }
    reader.readAsText(event.target.files[0]);

    this.setState({
      jsonName: event.target.files[0].name.substring(
        0,
        event.target.files[0].name.lastIndexOf(".")
      )
    });
  }

  // play section if end > start
  playSection() {
    var myPlayer = videojs.getPlayer("videoJS");
    var startInput = parseInt(document.getElementById("start").value);
    var endInput = parseInt(document.getElementById("end").value);
    var start =
      frameToSecs(
        startInput,
        this.state.history[
          this.state.history.length - 1 - this.state.historyIndex
        ][0]["fps"]
      ) || 0;
    var end =
      frameToSecs(
        endInput,
        this.state.history[
          this.state.history.length - 1 - this.state.historyIndex
        ][0]["fps"]
      ) || myPlayer.duration();

    if (end > start) {
      myPlayer.currentTime(start);
      myPlayer.on("timeupdate", function(e) {
        if (myPlayer.currentTime() >= end) {
          console.log("paused", myPlayer.currentTime(), end);
          myPlayer.pause();
          myPlayer.off("timeupdate");
        }
      });
      myPlayer.play();
    } else {
      alert("end time should be bigger than start time");
      return;
    }
  }

  jumpTo() {
    console.log("here");
    var myPlayer = videojs.getPlayer("videoJS");
    var startInput = parseInt(document.getElementById("start").value);
    var endInput = parseInt(document.getElementById("end").value);
    var start =
      frameToSecs(
        startInput,
        this.state.history[
          this.state.history.length - 1 - this.state.historyIndex
        ][0]["fps"]
      ) || 0;
    var end =
      frameToSecs(
        endInput,
        this.state.history[
          this.state.history.length - 1 - this.state.historyIndex
        ][0]["fps"]
      ) || myPlayer.duration();

    myPlayer.currentTime(start);
    console.log(myPlayer);

    if (end > start) {
      myPlayer.on("timeupdate", function(e) {
        if (myPlayer.currentTime() >= end) {
          console.log("paused", myPlayer.currentTime(), end);
          myPlayer.pause();
          myPlayer.off("timeupdate");
        }
      });
    } else {
      alert("Please set end frame to be bigger than start frame.");
    }

    myPlayer.play();
  }

  saveMetadata(
    metadata,
    segmentIndex = this.state.segmentIndex,
    segmentStart = this.state.segmentStart,
    segmentEnd = this.state.segmentEnd
  ) {
    // var sort =
    metadata = update(metadata, {
      annotations: {
        $apply: arr =>
          arr.sort(
            (a, b) =>
              a["segment"][0] - b["segment"][0] ||
              a["segment"][1] - b["segment"][1]
          )
      }
    });
    var newIndex = metadata["annotations"].reduce((acc, curr, index) => {
      if (curr["segmentIndex"] === segmentIndex) {
        acc.push(index);
      }
      return acc;
    }, [])[0];
    metadata = update(metadata, {
      annotations: {
        $apply: arr => {
          return arr.map((event, index) => {
            return update(event, { segmentIndex: { $set: index } });
          });
        }
      }
    });
    console.log(newIndex, metadata);
    var history = update(
      this.state.history.slice(
        0,
        this.state.history.length - this.state.historyIndex
      ),
      { $push: [[metadata, segmentIndex]] }
    );
    history = history.slice(Math.max(history.length - 20, 0));

    this.setState({
      saved: true,
      history: history,
      historyIndex: 0,
      segmentIndex: newIndex,
      segmentStart: segmentStart,
      segmentEnd: segmentEnd
    });
  }

  addEvent() {
    const newIndex = this.state.history[
      this.state.history.length - 1 - this.state.historyIndex
    ][0]["annotations"].length;

    const videoEnd = secsToFrame(
      this.state.videoEndSecs,
      this.state.history[
        this.state.history.length - 1 - this.state.historyIndex
      ][0]["fps"]
    );

    const segmentStart = Math.min(
      this.state.history[
        this.state.history.length - 1 - this.state.historyIndex
      ][0]["annotations"][newIndex - 1]["segment"][1] + 1,
      videoEnd
    );

    var metadata = update(
      this.state.history[
        this.state.history.length - 1 - this.state.historyIndex
      ][0],
      {
        annotations: {
          $push: [
            {
              segmentIndex: newIndex,
              labelEvent: null,
              labelEventIndex: null,
              segment: [segmentStart, videoEnd],
              labelScene: [],
              labelSceneIndex: [],
              numberOfScenes: 0,
              labelAction: [],
              labelActionIndex: [],
              numberOfActions: []
            }
          ]
        }
      }
    );
    console.log(
      this.state.history[
        this.state.history.length - 1 - this.state.historyIndex
      ][0]["annotations"],
      metadata
    );
    // this.setState({
    //   segmentIndex: newIndex,
    //   segmentStart: segmentStart,
    //   segmentEnd: videoEnd,
    // });
    this.saveMetadata(metadata, newIndex, segmentStart, videoEnd);
  }

  undo() {
    var historyIndex = this.state.historyIndex;
    historyIndex = Math.min(this.state.history.length - 1, historyIndex + 1);
    this.setState({
      historyIndex: historyIndex,
      segmentIndex: this.state.history[
        this.state.history.length - 1 - this.state.historyIndex
      ][1]
    });
  }

  redo() {
    var historyIndex = this.state.historyIndex;
    historyIndex = Math.max(0, historyIndex - 1);
    this.setState({
      historyIndex: historyIndex,
      segmentIndex: this.state.history[
        this.state.history.length - 1 - this.state.historyIndex
      ][1]
    });
  }

  saveVideoPreview() {
    if (this.state.segmentEnd < this.state.segmentStart) {
      alert("End frame cannot be smaller than start frame");
      return;
    }

    var currentMetadata = this.state.history[
      this.state.history.length - 1 - this.state.historyIndex
    ][0];

    // if nothing changed don't do anything
    if (
      currentMetadata["annotations"][this.state.segmentIndex]["segment"][0] ===
        this.state.segmentStart &&
      currentMetadata["annotations"][this.state.segmentIndex]["segment"][1] ===
        this.state.segmentEnd
    ) {
      return;
    }

    var metadata = update(currentMetadata, {
      annotations: {
        [this.state.segmentIndex]: {
          segment: {
            $set: [this.state.segmentStart, this.state.segmentEnd]
          }
        }
      }
    });
    this.saveMetadata(metadata);
  }

  export() {
    // TODO: check if saved right now
    if (!this.state.saved) {
      const r = window.confirm(
        "You have unsaved changes. Click OK to export the last saved version. Click cancel to cancel export."
      );
      if (!r) return;
    }

    var metadata = this.state.history[
      this.state.history.length - 1 - this.state.historyIndex
    ][0];
    var json = this.state.json;
    json["database"][this.state.videoName] = metadata;

    console.log(json);
    var dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(json, null, 2));
    var dlAnchorElem = document.createElement("a");
    // var data = new File([json], "filename.json", {type: 'text/json;charset=utf-8'});
    // var jsonURL = URL.createObjectURL(data);
    // var tempLink = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);

    // tempLink.href = jsonURL;
    dlAnchorElem.setAttribute("download", "changed.json");
    dlAnchorElem.click();
  }

  setScenesActions(items, mode) {
    var metadata;
    if (mode === "scenes") {
      metadata = update(
        this.state.history[
          this.state.history.length - 1 - this.state.historyIndex
        ][0],
        {
          annotations: {
            [this.state.segmentIndex]: {
              labelScene: { $set: items }
            }
          }
        }
      );
      metadata = update(metadata, {
        annotations: {
          [this.state.segmentIndex]: {
            labelSceneIndex: { $set: items.map(scene => scenes[scene]) }
          }
        }
      });

      metadata = update(metadata, {
        annotations: {
          [this.state.segmentIndex]: {
            numberOfScenes: { $set: items.length }
          }
        }
      });
    } else if (mode === "actions") {
      metadata = update(
        this.state.history[
          this.state.history.length - 1 - this.state.historyIndex
        ][0],
        {
          annotations: {
            [this.state.segmentIndex]: {
              labelAction: { $set: items }
            }
          }
        }
      );
      metadata = update(metadata, {
        annotations: {
          [this.state.segmentIndex]: {
            labelActionIndex: { $set: items.map(action => actions[action]) }
          }
        }
      });

      metadata = update(metadata, {
        annotations: {
          [this.state.segmentIndex]: {
            numberOfActions: { $set: items.length }
          }
        }
      });
    }
    this.saveMetadata(metadata);
  }
  // async handleFilesSubmit(e) {
  //   console.log(e);
  //   console.log(e.target);

  //   e.preventDefault();

  //   const form = e.target;
  //   const formData = new FormData(form);

  //   // await fetch('/api/uploads/' + 1, {
  //   //   method: 'POST',
  //   //   body: formData,
  //   // });

  //   // this.props.onChange();
  //   const video = this.state.video;
  //   var fileURL = URL.createObjectURL(video);

  //   var myVideo = document.getElementById("video");
  //   console.log(fileURL);
  //   myVideo.src = fileURL;
  //   myVideo.play();
  //   // form.reset();
  // }
  videoPreviewChange(frame, name) {
    if (name === "start") {
      this.setState({ saved: false, segmentStart: frame });
    } else if (name === "end") {
      this.setState({ saved: false, segmentEnd: frame });
    }
  }

  setEvent(value) {
    var metadata = update(
      this.state.history[
        this.state.history.length - 1 - this.state.historyIndex
      ][0],
      {
        annotations: {
          [this.state.segmentIndex]: { labelEvent: { $set: value } }
        }
      }
    );
    metadata = update(metadata, {
      annotations: {
        [this.state.segmentIndex]: { labelEventIdx: { $set: events[value] } }
      }
    });
    this.saveMetadata(metadata);
    // console.log(metadata);
    // console.log('old', this.state.metadata);
    // this.setState({
    //   segmentEvent: value
    // });
    // this.saveSegment();
  }

  renderEvents() {
    return this.state.history.length > 0
      ? "annotations" in
        this.state.history[
          this.state.history.length - 1 - this.state.historyIndex
        ][0]
        ? this.state.history[
            this.state.history.length - 1 - this.state.historyIndex
          ][0]["annotations"].map((prop, i) => (
            <Event
              key={i}
              {...prop}
              index={i}
              onClick={() => {
                if (!this.state.saved) {
                  const r = window.confirm(
                    "You have unsaved changes. Navigating to another event will discard these unsaved changes. Continue?"
                  );
                  if (!r) {
                    return;
                  }
                }
                this.setState({
                  segmentStart: prop["segment"][0],
                  segmentEnd: prop["segment"][1],
                  segmentIndex: prop["segmentIndex"],
                  segmentActions: prop["labelAction"],
                  segmentScenes: prop["labelScene"]
                });
              }}
            />
          ))
        : null
      : null;
  }

  render() {
    const ready = this.state.json && this.state.videoName;
    const editReady =
      this.state.segmentIndex > 0 || this.state.segmentIndex === 0;
    const active = !ready || !editReady;
    const content = !ready ? (
      <div>
        <Header as="h2" inverted>
          Please complete uploading the video and json file.
        </Header>
      </div>
    ) : !editReady ? (
      <div>
        <Header as="h2" inverted>
          Click on an event on the sidebar to start editing.
        </Header>
      </div>
    ) : (
      <div>
        <Header as="h2" inverted>
          Something went wrong.
        </Header>
      </div>
    );

    const currentMetadata = this.state.history[
      this.state.history.length - 1 - this.state.historyIndex
    ]
      ? this.state.history[
          this.state.history.length - 1 - this.state.historyIndex
        ][0]
      : null;
    return (
      <div style={{ display: "flex", height: "100vh", flexDirection: "row" }}>
        <GlobalHotKeys keyMap={keyMap} handlers={this.handlers} />
        <div
          style={{
            display: this.state.visibleMenu ? "flex" : "none",
            flexDirection: "column",
            padding: "1em",
            borderRight: "1px solid #ccc",
            height: "100%",
            flex: 1,
            maxWidth: 300,
            backgroundColor: "#fff",
            minWidth: "max-content",
            maxWidth: "300px"
          }}
        >
          <Header size="large" style={{ flex: "0 0 auto" }}>
            Events
            <Icon
              size="small"
              name="close"
              style={{ float: "right", marginRight: 0 }}
              onClick={() => this.setState({ visibleMenu: false })}
            />
          </Header>
          <div style={{ flex: 1, overflowY: "auto" }}>
            <Button
              fluid
              positive
              icon
              labelPosition="left"
              onClick={this.addEvent}
              disabled={Object.keys(this.state.history).length === 0} //only have history with uploaded json and vid matching
            >
              {" "}
              <Icon name="add" size="small" />
              Add Event
            </Button>
            <List divided selection>
              {this.renderEvents()}
            </List>
          </div>
          <Button
            icon
            labelPosition="left"
            onClick={this.export}
            disabled={Object.keys(this.state.history).length === 0}
          >
            <Icon name="download" />
            Export
          </Button>
        </div>
        <div
          style={{
            height: "auto",
            padding: "1em 0.5em",
            borderRight: "1px solid #ccc",
            display: this.state.visibleMenu ? "none" : "flex",
            flexDirection: "column",
            maxWidth: "50px",
            alignItems: "center"
          }}
        >
          <Icon
            size="large"
            name="bars"
            onClick={() => this.setState({ visibleMenu: true })}
            style={{ marginRight: 0 }}
          />
          <div style={{ display: "flex", flex: 1 }}></div>
          <Button
            size="small"
            icon
            onClick={this.export}
            disabled={Object.keys(this.state.history).length === 0}
          >
            <Icon name="download" />
          </Button>
        </div>
        <div
          style={{
            display: "flex",
            flex: "8 1 0",
            flexDirection: "column",
            height: "100%",
            backgroundColor: "#ddd",
            alignItems: "center",
            justifyContent: "space-between"
            // overflowX: "auto"
          }}
        >
          {/* <Form
          method="post"
          encType="multipart/form-data"
        >
          <Form.Input
            label="Upload files from disk"
            multiple
            type="file"
            id="videos"
            name="videos"
            accept="video/*"
            // onChange={(e) => this.setState({video: e.target.value})}
          />
          <Button type="submit">Upload</Button>
        </Form> */}
          <div
            style={{
              display: "flex",
              flex: "0 0 auto",
              width: "100%",
              flexDirection: "column",
              alignItems: "center",
              paddingBottom: "10px"
            }}
          >
            <input
              id="input_video"
              type="file"
              accept="video/*"
              onChange={e => {
                // this.setState({ video: e.target.value });
                this.playSelectedFile(e);
              }}
            />
            <input
              id="input_json"
              type="file"
              accept=".json, application/json"
              onChange={e => {
                this.parseJSONInput(e);
              }}
            />
            {/* below this.state.video should be a prop passed on from project page or maybe not*/}
            <VideoPlayer id="videoJS" {...videoJsOptions} />
          </div>
          {/* <Grid stackable columns = {2}>
            <Grid.Column> */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              backgroundColor: "#fff",
              overflowX: "auto",
              flex: 1
            }}
          >
            <Dimmer.Dimmable
              blurring
              dimmed={active}
              style={{ height: "100%" }}
            >
              <Dimmer active={active} content={content} />
              <div style={{ display: "block" }}>
                <Header size="large" style={{ padding: "5px 10px" }}>
                  Event {this.state.segmentIndex}
                </Header>
              </div>
              {/* <Grid columns = {3} divided style={{
                  display: "flex",
                  flex: 1,
                  flexDirection: "row"
                }}> */}
              <div
                // className="container"
                style={{
                  display: "flex",
                  flex: 1,
                  flexDirection: "row",
                  flexWrap: "wrap",
                  alignItems: "center",
                  overflowY: "auto",
                  height: "calc(100vh - 494px)",
                  alignContent: "flex-start"
                }}
              >
                {/* <Grid.Column> */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    width: "100%",
                    paddingBottom: "5px"
                  }}
                >
                  <div style={{ display: "block", padding: "5px 10px" }}>
                    <b>Type: </b>
                    <Dropdown
                      key={this.state.segmentIndex}
                      search
                      selection
                      onChange={(e, { value }) => this.setEvent(value)}
                      options={Object.keys(events).map(event =>
                        Object({
                          key: events[event],
                          text: event,
                          value: event
                        })
                      )}
                      defaultValue={
                        editReady
                          ? currentMetadata["annotations"][
                              this.state.segmentIndex
                            ]["labelEvent"]
                          : null
                      }
                    ></Dropdown>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flex: 0,
                      flexDirection: "row",
                      height: "100%",
                      alignItems: "center",
                      justifyContent: "space-around"
                    }}
                  >
                    <VideoPreview
                      key={
                        this.state.videoName + this.state.segmentIndex + "start"
                      }
                      name="start"
                      frame={editReady ? this.state.segmentStart : 0}
                      onChange={this.videoPreviewChange}
                      fps={currentMetadata ? currentMetadata["fps"] : null}
                      src={this.state.videoSrc}
                      end={this.state.videoEndSecs}
                    />
                    <VideoPreview
                      key={
                        this.state.videoName + this.state.segmentIndex + "end"
                      }
                      name="end"
                      frame={
                        editReady
                          ? this.state.segmentEnd
                          : secsToFrame(
                              this.state.videoEndSecs,
                              currentMetadata ? currentMetadata["fps"] : 0
                            ) || 0
                      }
                      onChange={this.videoPreviewChange}
                      fps={currentMetadata ? currentMetadata["fps"] : null}
                      src={this.state.videoSrc}
                      end={this.state.videoEndSecs}
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flex: 0,
                      flexDirection: "row",
                      height: "100%",
                      alignItems: "center",
                      justifyContent: "space-around"
                    }}
                  >
                    <Button
                      content="Play section"
                      icon="play"
                      labelPosition="left"
                      onClick={this.playSection}
                    />
                    <Button
                      icon
                      labelPosition="left"
                      onClick={e => {
                        this.saveVideoPreview();
                      }}
                    >
                      <Icon name="save" />
                      Save frames
                    </Button>
                  </div>
                </div>
                {/* </Grid.Column>
                <Grid.Column> */}
                <div style={{ display: "flex", flex: 1, flexDirection: "row" }}>
                  <ScenesActions
                    key={this.state.segmentIndex + "scenes"}
                    mode="scenes"
                    items={
                      editReady
                        ? currentMetadata["annotations"][
                            this.state.segmentIndex
                          ]["labelScene"].map(item => item.toLowerCase())
                        : []
                    }
                    style={{ flex: 2 }}
                    onChange={this.setScenesActions}
                  />
                  {/* </Grid.Column>
                  <Grid.Column> */}
                  <ScenesActions
                    key={this.state.segmentIndex + "actions"}
                    mode="actions"
                    items={
                      editReady
                        ? currentMetadata["annotations"][
                            this.state.segmentIndex
                          ]["labelAction"].map(item => item.toLowerCase())
                        : []
                    }
                    style={{ flex: 3 }}
                    onChange={this.setScenesActions}
                  />
                </div>
                {/* </Grid.Column> */}
                {/* </div> */}
              </div>
              {/* </Grid> */}
            </Dimmer.Dimmable>
          </div>

          {/* </Dimmer.Dimmable> */}
          {/* </Grid.Column>
            <Grid.Column> */}
          {/* <List> */}

          {/* </List> */}

          {/* </Grid.Column>
          </Grid> */}
        </div>
      </div>
    );
  }
}

export default App;

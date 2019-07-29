import React, { Component } from "react";
import "./App.css";
import UploadVideos from "./UploadVideos";
import VideoPlayer from "./VideoPlayer";
import "video.js/dist/video-js.css";
import videojs from "video.js";
import Event from "./Event";
import VideoPreview from "./VideoPreview";
import { frameToSecs, secsToFrame, scenes, events, actions } from "./utils";
import Sortable from "react-sortablejs";
import ScenesActions from "./ScenesActions";

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
      metadata: Object(),
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
    this.saveSegment = this.saveSegment.bind(this);
    this.export = this.export.bind(this);
    this.setScenesActions = this.setScenesActions.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    const videoNameJSONUpdated =
      prevState["videoName"] !== this.state.videoName ||
      prevState["json"] !== this.state.json;
    // if video or json updated
    if (videoNameJSONUpdated) {
      // if video and json exists
      if (this.state.videoName && this.state.json) {
        // if video and json match
        if (
          Object.keys(this.state.json["database"]).indexOf(
            this.state.videoName
          ) >= 0
        ) {
          this.setState({
            metadata: this.state.json["database"][this.state.videoName],
            videoEnd: secsToFrame(
              this.state.videoEndSecs,
              this.state.json["database"][this.state.videoName]["fps"]
            ),
            saved: true,
            visibleMenu: true,
            history: []
          });
        } else {
          this.setState({
            metadata: Object(),
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
          metadata: Object(),
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
        videoEndSecs: null,
        metadata: Object()
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
    var start = frameToSecs(startInput, this.state.metadata["fps"]) || 0;
    var end =
      frameToSecs(endInput, this.state.metadata["fps"]) || myPlayer.duration();

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
    var start = frameToSecs(startInput, this.state.metadata["fps"]) || 0;
    var end =
      frameToSecs(endInput, this.state.metadata["fps"]) || myPlayer.duration();

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

  saveSegment() {
    var metadata = this.state.metadata;

    // saving events
    metadata["annotations"][this.state.segmentIndex][
      "labelEvent"
    ] = this.state.segmentEvent;
    metadata["annotations"][this.state.segmentIndex]["labelEventIdx"] =
      events[this.state.segmentEvent];

    // saving actions
    metadata["annotations"][this.state.segmentIndex][
      "labelAction"
    ] = this.state.segmentActions;
    metadata["annotations"][this.state.segmentIndex][
      "labelActionIndex"
    ] = this.state.segmentActions.map(action => actions[action]);
    metadata["annotations"][this.state.segmentIndex][
      "numberOfActions"
    ] = this.state.segmentActions.length;

    // saving scenes
    metadata["annotations"][this.state.segmentIndex][
      "labelScene"
    ] = this.state.segmentScenes;
    metadata["annotations"][this.state.segmentIndex][
      "labelSceneIndex"
    ] = this.state.segmentScenes.map(scene => scenes[scene]);
    metadata["annotations"][this.state.segmentIndex][
      "numberOfScenes"
    ] = this.state.segmentScenes.length;

    metadata["annotations"][this.state.segmentIndex]["segment"] = [
      this.state.segmentStart,
      this.state.segmentEnd
    ];

    this.setState({
      metadata: metadata,
      saved: true
    });
  }

  export() {
    // TODO: check if saved right now
    if (!this.state.saved) {
      const r = window.confirm(
        "You have unsaved changes. Click OK to export the last saved version. Click cancel to cancel export."
      );
      if (!r) return;
    }
    var metadata = this.state.metadata;
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
    if (mode === "scenes") {
      this.setState({
        segmentScenes: items,
        saved: false
      });
    } else if (mode === "actions") {
      this.setState({
        segmentActions: items,
        saved: false
      });
    }
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

  renderEvents() {
    return "annotations" in this.state.metadata
      ? this.state.metadata["annotations"].map((prop, i) => (
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

    return (
      <div style={{ display: "flex", height: "100vh", flexDirection: "row" }}>
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
          <List divided selection style={{ flex: 1, overflowY: "auto" }}>
            {this.renderEvents()}
          </List>
          <Button icon labelPosition="left" onClick={this.export}>
            <Icon name="download" />
            Export
          </Button>
        </div>
        <div
          hidden={this.state.visibleMenu}
          style={{
            height: "auto",
            padding: "1em",
            borderRight: "1px solid #ccc"
          }}
        >
          <Icon
            size="large"
            name="bars"
            onClick={() => this.setState({ visibleMenu: true })}
          />
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
              fluid
              blurring
              dimmed={active}
              style={{ height: "100%" }}
            >
              <Dimmer active={active} content={content} />
              <div style={{ display: "block" }}>
                <Header size="large" style={{ padding: "5px 10px" }}>
                  Event {this.state.segmentIndex}
                </Header>
                <Button icon labelPosition="left" onClick={this.saveSegment}>
                  <Icon name="save" />
                  Save
                </Button>
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
                      onChange={(e, { value }) => {
                        this.setState({
                          segmentEvent: value
                        });
                      }}
                      options={Object.keys(events).map(event =>
                        Object({
                          key: events[event],
                          text: event,
                          value: event
                        })
                      )}
                      defaultValue={
                        editReady
                          ? this.state.metadata["annotations"][
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
                      frame={
                        editReady
                          ? this.state.metadata["annotations"][
                              this.state.segmentIndex
                            ]["segment"][0]
                          : 0
                      }
                      onChange={this.videoPreviewChange}
                      fps={this.state.metadata["fps"]}
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
                          ? this.state.metadata["annotations"][
                              this.state.segmentIndex
                            ]["segment"][1]
                          : this.state.videoEnd
                      }
                      onChange={this.videoPreviewChange}
                      fps={this.state.metadata["fps"]}
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
                        ? this.state.segmentScenes.map(item =>
                            item.toLowerCase()
                          )
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
                        ? this.state.segmentActions.map(item =>
                            item.toLowerCase()
                          )
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

import React, { Component } from "react";
import "./App.css";
import UploadVideos from "./UploadVideos";
import VideoPlayer from "./VideoPlayer";
import "video.js/dist/video-js.css";
import videojs from "video.js";
import Event from "./Event";
import VideoPreview from "./VideoPreview";
import { frameToSecs, secsToFrame, scenes, events } from "./utils";
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
      videoSrc: null,
      json: null,
      metadata: Object(),
      segmentStart: null,
      segmentEnd: null,
      segmentIndex: null,
      videoEnd: 0,
      visibleMenu: true
    };
    this.playSelectedFile = this.playSelectedFile.bind(this);
    this.jumpTo = this.jumpTo.bind(this);
    this.parseJSONInput = this.parseJSONInput.bind(this);
    // this.frameToSecs = this.frameToSecs.bind(this);
    this.playSection = this.playSection.bind(this);
    this.videoPreviewChange = this.videoPreviewChange.bind(this);
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
        if (Object.keys(this.state.json).indexOf(this.state.videoName) >= 0) {
          this.setState({
            metadata: this.state.json[this.state.videoName],
            videoEnd: secsToFrame(
              videojs.getPlayer("videoJS").duration(),
              this.state.json[this.state.videoName]["fps"]
            ),
            segmentIndex: this.state.segmentIndex
          });
        } else {
          this.setState({
            metadata: Object(),
            videoEnd: null,
            segmentIndex: null
          });
          alert(
            "Upload a video with the correct filename or upload the correct json file."
          );
        }
      } else {
        this.setState({
          metadata: Object(),
          videoEnd: null,
          segmentIndex: null
        });
      }
    }
  }

  // on video upload
  playSelectedFile(event) {
    var file = event.target.files[0];

    if (!file) {
      this.setState({
        videoName: null,
        videoSrc: null,
        segmentIndex: null
      });
      return;
    }

    var segmentIndex = 0;
    // if input changed but there was a previous videoSrc
    // TODO: generate unique segmentIndex per new upload of video, just to reset videopreview and list
    if (this.state.videoSrc) {
      // segmentIndex = this.state.segmentIndex + '0';
    }

    const player = videojs.getPlayer("videoJS");

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
      }
    });
    // console.log(videojs.getPlayer("videoJSEnd"));
  }

  parseJSONInput(event) {
    var reader = new FileReader();
    reader.onload = event => {
      this.setState({
        json: JSON.parse(event.target.result)["database"]
      });
    };
    // } function(event){
    //   console.log(JSON.parse(event.target.result)['database']);
    //   this.setState({
    //     metadata: JSON.parse(event.target.result)['database'],
    //   })
    // }
    reader.readAsText(event.target.files[0]);
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
    }

    myPlayer.play();
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
  videoPreviewChange(e) {
    // this.setState({
    //   segmentEnd: parseInt(e.target.value)
    // });
  }

  renderEvents() {
    return "annotations" in this.state.metadata
      ? this.state.metadata["annotations"].map((prop, i) => (
          <Event
            key={i}
            {...prop}
            index={i}
            onClick={() =>
              this.setState({
                segmentStart: prop["segment"][0],
                segmentEnd: prop["segment"][1],
                segmentIndex: prop["segmentIndex"]
              })
            }
          />
        ))
      : null;
  }
  render() {
    return (
      <div style={{ display: "flex", height: "100vh", flexDirection: "row" }}>
        <div
          style={{
            flexDirection: "column",
            padding: "1em",
            borderRight: "1px solid #ccc",
            height: "100%",
            flex: 1,
            maxWidth: 300,
            backgroundColor: "#fff",
            minWidth: "max-content"
          }}
          hidden={!this.state.visibleMenu}
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
        </div>
        <div
          hidden={this.state.visibleMenu}
          style={{ height: "auto", margin: "1em" }}
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
            flex: "4 1 0",
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
          <div style={{ display: "block", flex: "0 0 auto" }}>
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
          {/* <Dimmer.Dimmable as={Segment} dimm  */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              backgroundColor: "#fff"
            }}
          >
            <div style={{ display: "block" }}>
              <Header size="large" style={{ padding: "5px 10px" }}>
                Event {this.state.segmentIndex}
              </Header>
            </div>
            <div
              style={{
                display: "flex",
                flex: 1,
                flexDirection: "row"
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column"
                }}
              >
                <div style={{ display: "block", padding: "5px 10px" }}>
                  <b>Type: </b>
                  <Dropdown
                    key={this.state.segmentIndex}
                    search
                    selection
                    options={Object.keys(events).map(event =>
                      Object({
                        key: events[event],
                        text: event,
                        value: event
                      })
                    )}
                    defaultValue={
                      this.state.segmentIndex > 0 ||
                      this.state.segmentIndex === 0
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
                    key={this.state.segmentIndex + "start"}
                    name="start"
                    frame={this.state.segmentStart || 0}
                    onChange={this.videoPreviewChange}
                    fps={this.state.metadata["fps"]}
                    src={this.state.videoSrc}
                    end={this.state.videoEnd}
                  />
                  <VideoPreview
                    key={this.state.segmentIndex + "end"}
                    name="end"
                    frame={this.state.segmentEnd || this.state.videoEnd}
                    onChange={this.videoPreviewChange}
                    fps={this.state.metadata["fps"]}
                    src={this.state.videoSrc}
                    end={this.state.videoEnd}
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
                  <Button icon labelPosition="right">
                    <Icon name="save" />
                    Save
                  </Button>
                </div>
              </div>
              {/* <div
                style={{
                  display: "flex",
                  flex: "1 1 0",
                  flexDirection: "row",
                  height: "100%",
                  width: '100%',
                  backgroundColor: "#F0E68C",
                  alignItems: "center",
                  justifyContent: "space-around"
                }}
              > */}
              <ScenesActions
                key={this.state.segmentIndex + "scenes"}
                mode="scenes"
                items={
                  this.state.segmentIndex > 0 || this.state.segmentIndex === 0
                    ? this.state.metadata["annotations"][
                        this.state.segmentIndex
                      ]["labelScene"]
                    : []
                }
              />
              {/* </div> */}
              {/* <div
                  style={{
                    display: "flex",
                    flex: "1 1 0",
                    flexDirection: "row",
                    height: "100%",
                    width: '100%',
                    backgroundColor: "#F0E68C",
                    alignItems: "center",
                    justifyContent: "space-around"
                  }}
                > */}
              <ScenesActions
                key={this.state.segmentIndex + "actions"}
                mode="actions"
                items={
                  this.state.segmentIndex > 0 || this.state.segmentIndex === 0
                    ? this.state.metadata["annotations"][
                        this.state.segmentIndex
                      ]["labelAction"]
                    : []
                }
              />
              {/* </div> */}
            </div>
          </div>
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

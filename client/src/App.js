import React, { Component } from "react";
import "./App.css";
import UploadVideos from "./UploadVideos";
import VideoPlayer from "./VideoPlayer";
import "video.js/dist/video-js.css";
import videojs from "video.js";
import Event from "./Event";
import VideoPreview from "./VideoPreview";
import { frameToSecs } from "./utils";

import { Header, Form, Button, Icon, List } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";

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
      segmentIndex: 0
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
    if (videoNameJSONUpdated && this.state.videoName && this.state.json) {
      if (Object.keys(this.state.json).indexOf(this.state.videoName) >= 0) {
        this.setState({
          metadata: this.state.json[this.state.videoName],
          segmentStart: 0,
          segmentEnd: videojs.getPlayer("videoJS").duration()
        });
      } else {
        alert("Upload a video with the correct filename.");
      }
    }
  }

  // on video upload
  playSelectedFile(event) {
    var file = event.target.files[0];
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

    const playerStart = videojs.getPlayer("videoJSStart");
    playerStart.src({
      src: fileURL,
      type: file.type
    });
    this.setState({
      videoName: file.name.substring(0, file.name.lastIndexOf(".")),
      videoSrc: {
        src: fileURL,
        type: file.type
      }
    });
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
    var myPlayer = videojs.getPlayer("videoJS");
    var startInput = parseInt(document.getElementById("start").value);
    var endInput = parseInt(document.getElementById("end").value);
    var start = frameToSecs(startInput, this.state.metadata["fps"]) || 0;
    var end =
      frameToSecs(endInput, this.state.metadata["fps"]) || myPlayer.duration();

    myPlayer.currentTime(start);

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

    var screenStart = videojs.getPlayer("videoJSStart");
    screenStart.currentTime(start);

    // var screenEnd = videojs.getPlayer("videoJSEnd");
    // console.log('test videopreview, ' + screenEnd)
    // screenEnd.currentTime(end);
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
    this.setState({
      segmentEnd: parseInt(e.target.value)
    });
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
                segmentIndex: prop["segmentIndex"] + 1
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
            display: "flex",
            flexDirection: "column",
            padding: "1em 0.5em",
            borderRight: "1px solid #ccc",
            height: "100%",
            flex: 1,
            maxWidth: 300
          }}
        >
          <Header size="large" style={{ flex: "0 0 auto" }}>
            Events
          </Header>
          <List divided selection style={{ flex: 1, overflowY: "auto" }}>
            {this.renderEvents()}
          </List>
        </div>
        <div
          style={{
            display: "flex",
            flex: "4 1 0",
            flexDirection: "column",
            height: "100%",
            backgroundColor: "#ddd",
            alignItems: "center",
            justifyContent: "space-around"
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

          <div
            style={{
              display: "flex",
              flex: "1 1 0",
              flexDirection: "row",
              height: "100%",
              backgroundColor: "#ddd",
              alignItems: "center",
              justifyContent: "space-around"
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: 5
              }}
            >
              <input type="number" id="start" onChange={this.jumpTo}></input>
              <VideoPlayer id="videoJSStart" {...videoPreviewOptions} />
            </div>
            {/* <VideoPreview name="start" time={this.state.segmentStart} key={this.state.segmentIndex+"start"} onChange={this.videoPreviewChange} fps= {this.state.metadata['fps']} src = {this.state.videoSrc}/> */}
            <VideoPreview
              name="end"
              time={this.state.segmentEnd}
              key={this.state.segmentIndex + "end"}
              onChange={this.videoPreviewChange}
              fps={this.state.metadata["fps"]}
              src={this.state.videoSrc}
            />
            {/* <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: 5
              }}
            >
              <input type="number" id="end" default={this.state.segmentEnd} disabled= {!this.state.segmentEnd} onChange={this.jumpTo}></input>
              <VideoPlayer id="videoJSEnd" {...videoPreviewOptions} />
            </div> */}
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
      </div>
    );
  }
}

export default App;

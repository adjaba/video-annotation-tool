import React, { Component } from "react";
import "./App.css";
import UploadVideos from "./UploadVideos";
import VideoPlayer from "./VideoPlayer";
import "video.js/dist/video-js.css";
import videojs from "video.js";

import { Header, Form, Button } from "semantic-ui-react";

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
      json: null,
      metadata: null
    };
    this.playSelectedFile = this.playSelectedFile.bind(this);
    this.jumpTo = this.jumpTo.bind(this);
    this.parseJSONInput = this.parseJSONInput.bind(this);
    this.frameToSecs = this.frameToSecs.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    const videoNameJSONUpdated =
      prevState["videoName"] !== this.state.videoName ||
      prevState["json"] !== this.state.json;
    if (videoNameJSONUpdated && this.state.videoName && this.state.json) {
      console.log(Object.keys(this.state.json));
      if (Object.keys(this.state.json).indexOf(this.state.videoName) >= 0) {
        this.setState({
          metadata: this.state.json[this.state.videoName]
        });
      } else {
        alert("Upload a video with the correct filename.");
      }
    }
  }

  playSelectedFile(event) {
    var file = event.target.files[0];
    const players = ["videoJS", "videoJSStart", "videoJSEnd"].map(id =>
      videojs.getPlayer(id)
    );

    if (players[0].canPlayType(file.type) === "") {
      alert(
        "Cannot play video with type " +
          file.type +
          ", please select a different video or use a different browser."
      );
      return;
    }

    var fileURL = URL.createObjectURL(file);
    players.forEach(function(player) {
      player.src({
        src: fileURL,
        type: file.type
      });
    });
    this.setState({
      videoName: file.name.substring(0, file.name.lastIndexOf("."))
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

  frameToSecs(frame, fps) {
    return Math.floor(frame / fps) + parseInt(frame % fps) / fps;
  }

  jumpTo() {
    var myPlayer = videojs.getPlayer("videoJS");
    var startInput = parseInt(document.getElementById("start").value);
    var endInput = parseInt(document.getElementById("end").value);
    var start = this.frameToSecs(startInput, 29.97) || 0;
    var end = this.frameToSecs(endInput, 29.97) || myPlayer.duration();
    console.log(start, end);
    myPlayer.currentTime(start);

    myPlayer.off("timeupdate");

    if (end > start) {
      myPlayer.on("timeupdate", function(e) {
        if (myPlayer.currentTime() >= end) {
          console.log("paused", myPlayer.currentTime(), end);
          myPlayer.pause();
        }
      });
    }

    myPlayer.play();

    var screenStart = videojs.getPlayer("videoJSStart");
    console.log("screenStart setting" + screenStart.currentSrc());
    screenStart.currentTime(start);

    var screenEnd = videojs.getPlayer("videoJSEnd");
    screenEnd.currentTime(end);
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

  render() {
    return (
      <div style={{ display: "flex", height: "100vh", flexDirection: "row" }}>
        <div
          style={{
            display: "flex",
            flex: "1 1 0",
            flexDirection: "column",
            maxWidth: 300,
            height: "100%",
            backgroundColor: "#fff"
          }}
        >
          Annotation
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
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: 5
              }}
            >
              <input type="number" id="end" onChange={this.jumpTo}></input>
              <VideoPlayer id="videoJSEnd" {...videoPreviewOptions} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;

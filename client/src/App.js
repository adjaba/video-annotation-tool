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
  preload: "none"
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
      video: null,
      sources: []
    };
    this.playSelectedFile = this.playSelectedFile.bind(this);
    this.jumpTo = this.jumpTo.bind(this);
  }

  playSelectedFile(event) {
    var file = event.target.files[0];
    const players = ["videoJS", "videoJSStart", "videoJSEnd"].map(id =>
      videojs.getPlayer(id)
    );
    // var myPlayer = videojs.getPlayer("videoJS");

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
  }

  jumpTo() {
    var myPlayer = videojs.getPlayer("videoJS");
    var start =
      Math.floor(parseInt(document.getElementById("start").value) / 29.97) +
        parseInt(document.getElementById("start").value % 29.97) / 29.97 || 0;
    var end =
      Math.floor(parseInt(document.getElementById("end").value) / 29.97) +
        parseInt(document.getElementById("end").value % 29.97) / 29.97 ||
      myPlayer.duration();
    myPlayer.currentTime(start);
    if (end > start) {
      myPlayer.on("timeupdate", function(e) {
        if (myPlayer.currentTime() >= end) {
          myPlayer.pause();
        }
      });
    } else {
      myPlayer.off("timeupdate");
      myPlayer.play();
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
              this.setState({ video: e.target.value });
              this.playSelectedFile(e);
            }}
          />
          <input id="input_json" type="file" accept=".json, application/json" />
          {/* below this.state.video should be a prop passed on from project page or maybe not*/}
          <VideoPlayer id="videoJS" {...videoJsOptions} />
          <input type="number" id="start" onChange={this.jumpTo}></input>
          <VideoPlayer id="videoJSStart" {...videoPreviewOptions} />
          <input type="number" id="end" onChange={this.jumpTo}></input>
          <VideoPlayer id="videoJSEnd" {...videoPreviewOptions} />
        </div>
      </div>
    );
  }
}

export default App;

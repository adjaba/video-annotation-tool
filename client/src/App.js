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
  // sources: [
  //   {
  //     src: "",
  //     type: "video/mp4"
  //   }
  // ]
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      video: null,
      sources: []
    };
    // this.handleFilesSubmit = this.handleFilesSubmit.bind(this);
    this.playSelectedFile = this.playSelectedFile.bind(this);
    this.jumpTo = this.jumpTo.bind(this);
  }

  playSelectedFile(event) {
    console.log(event.target.files[0]);
    var file = event.target.files[0];
    // var type = file.type
    var videoNode = document.querySelector("video");
    var myPlayer = videojs.getPlayer("videoJS");
    console.log(myPlayer.canPlayType(file.type));
    // var canPlay = videoNode.canPlayType(type)
    // if (canPlay === '') canPlay = 'no'
    // var message = 'Can play type "' + type + '": ' + canPlay
    // var isError = canPlay === 'no'
    // displayMessage(message, isError)

    // if (isError) {
    //   return
    // }

    var fileURL = URL.createObjectURL(file);
    videoNode.src = fileURL;
    // var sources = this.state.sources;
    // this.setState({
    //   "sources": sources.push({
    //     "src": fileURL,
    //     "type": file.type,
    //   })
    // })
    videoJsOptions["sources"] = [Object()];
    videoJsOptions["sources"][0]["src"] = fileURL;
    videoJsOptions["sources"][0]["type"] = file.type;
    // console.log(videoJsOptions);
    // videoJsOptions = {
    //   autoplay: true,
    //   controls: true,
    //   preload: "none",
    //   sources: this.state.sources,
    // };
  }

  jumpTo() {
    var myPlayer = videojs.getPlayer("videoJS");
    var start = document.getElementById("start").value;
    console.log(myPlayer, start);
    myPlayer.currentTime(start);
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
            id="input"
            type="file"
            accept="video/*"
            onChange={e => {
              this.setState({ video: e.target.value });
              this.playSelectedFile(e);
            }}
          />
          <video id="video" controls autoPlay />
          {/* below this.state.video should be a prop passed on from project page */}
          {/* <VideoPlayer id = 'videoJS' {...videoJsOptions} /> */}
          {this.state.video ? (
            <VideoPlayer id="videoJS" {...videoJsOptions} />
          ) : null}
          <input type="number" id="start" onChange={this.jumpTo}></input>
          <input type="number" id="end" onChange={this.jumpTo}></input>
        </div>
      </div>
    );
  }
}

export default App;

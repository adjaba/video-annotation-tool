import React, { Component } from "react";
import "./App.css";
import UploadVideos from "./UploadVideos";
import VideoPlayer from "./VideoPlayer";
import "video.js/dist/video-js.css";

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

const videoJsOptions = {
  autoplay: true,
  controls: true,
  sources: [
    {
      src: "/path/to/video.mp4",
      type: "video/mp4"
    }
  ]
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      video: null
    };
    // this.handleFilesSubmit = this.handleFilesSubmit.bind(this);
    this.playSelectedFile = this.playSelectedFile.bind(this);
  }

  playSelectedFile(event) {
    console.log(event.target.files[0]);
    var file = event.target.files[0];
    // var type = file.type
    var videoNode = document.querySelector("video");
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
    videoJsOptions["sources"][0]["src"] = fileURL;
    videoJsOptions["sources"][0]["type"] = file.type;
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
      <div>
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
        {this.state.video ? <VideoPlayer {...videoJsOptions} /> : null}
      </div>
    );
  }
}

export default App;

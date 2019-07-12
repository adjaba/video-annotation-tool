import React, {Component} from 'react';
import './App.css';
import UploadVideos from './UploadVideos'

import {
  Header,
  Form,
  Button
} from 'semantic-ui-react';

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

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      video: null
    }
    // this.handleFilesSubmit = this.handleFilesSubmit.bind(this);
    this.playSelectedFile = this.playSelectedFile.bind(this);
  }
  
  playSelectedFile(event) {
    console.log(event.target.files[0]);
    var file = event.target.files[0];
    // var type = file.type
    var videoNode = document.querySelector('video')
    // var canPlay = videoNode.canPlayType(type)
    // if (canPlay === '') canPlay = 'no'
    // var message = 'Can play type "' + type + '": ' + canPlay
    // var isError = canPlay === 'no'
    // displayMessage(message, isError)

    // if (isError) {
    //   return
    // }

    var fileURL = URL.createObjectURL(file)
    videoNode.src = fileURL
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
        <input id='input' type="file" accept="video/*" onChange={(e) => {this.setState({video: e.target.value}); this.playSelectedFile(e);}}/>
        <video id="video" controls autoPlay/>
        <head>
          <link href="https://vjs.zencdn.net/7.6.0/video-js.css" rel="stylesheet"/>
          <script src="https://vjs.zencdn.net/ie8/1.1.2/videojs-ie8.min.js"/>
        </head>

        <body>
        <video id='my-video' class='video-js' controls preload='auto' width='640' height='264'
        poster='MY_VIDEO_POSTER.jpg' data-setup='{}'>
          <source src='MY_VIDEO.mp4' type='video/mp4' />
          <source src='MY_VIDEO.webm' type='video/webm' />
          <p class='vjs-no-js'>
            To view this video please enable JavaScript, and consider upgrading to a web browser that
            <a href='https://videojs.com/html5-video-support/' target='_blank'>supports HTML5 video </a>
          </p>
        </video>

        <script src='https://vjs.zencdn.net/7.6.0/video.js'></script>
      </body>
      </div>
    );
  }
}

export default App;

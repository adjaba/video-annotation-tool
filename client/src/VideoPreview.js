import React, { Component } from "react";
import VideoPlayer from "./VideoPlayer";
import videojs from "video.js";
import { frameToSecs, extractFramesFromVideo } from "./utils";
import { Input } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";

var videoPreviewOptions = {
  autoplay: false,
  preload: "auto",
  height: 200
};

export default class VideoPreview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      frame: this.props.frame,
      id:
        "videoJS" +
        this.props.name.charAt(0).toUpperCase() +
        this.props.name.slice(1)
    };
  }

  componentDidMount() {
    if (this.props.src) {
      videojs(this.state.id).src(this.props.src);
      videojs(this.state.id).currentTime(
        frameToSecs(this.state.frame, this.props.fps)
      );
      // let frames = extractFramesFromVideo(this.state.id, this.props.fps);
      // console.log(frames);
    }
  }

  handleChange = event => {
    console.log("there");
    var player = videojs.getPlayer(this.state.id);
    this.setState({
      frame: parseInt(event.target.value) //parseFloat(event.target.value)//
    });
    //player.currentTime(event.target.value);
    player.currentTime(frameToSecs(event.target.value, this.props.fps));

    console.log("current time", player.currentTime());
    console.log(player.getVideoPlaybackQuality().totalVideoFrames);
    // var video = document.getElementById('videoPlay'),
    // var lastTime = -1;
    // function draw(lastTime = -1) {
    //     var time = player.currentTime();
    //     if (time !== lastTime) {
    //         console.log('lastTime: ' + lastTime)
    //         console.log('time: ' + time);
    //         requestAnimationFrame(draw);

    //         //todo: do your rendering here
    //         lastTime = time;
    //         console.log('lastTime   :' + lastTime)
    //     }

    // //wait approximately 16ms and run again
    // }

    // draw()
  };

  componentWillUnmount() {
    console.log("unmounting videopreview", this.state.id);
  }

  render() {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: 5,
          justifyContent: "space-around"
        }}
      >
        <VideoPlayer id={this.state.id} {...videoPreviewOptions} />
        Frame
        <Input
          style={{ width: "100px" }}
          type="number"
          id={this.props.name}
          onChange={e => {
            this.handleChange(e);
            this.props.onChange(e);
          }}
          value={this.state.frame}
          min={0}
          max={this.props.end}
        ></Input>
        Approximate Time
        <Input
          style={{ width: "100px" }}
          type="number"
          id={this.props.name + "time"}
          disabled={true}
          value={parseFloat(frameToSecs(this.state.frame, this.props.fps))}
          key={this.props.name + "time"}
          min={0}
          max={this.props.end}
        ></Input>
      </div>
    );
  }
}

import React, { Component } from "react";
import VideoPlayer from "./VideoPlayer";
import videojs from "video.js";
import { frameToSecs, secsToFrame, extractFramesFromVideo } from "./utils";
import { Input } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import { runInThisContext } from "vm";

var videoPreviewOptions = {
  autoplay: false,
  preload: "auto",
  minWidth: "350px",
  maxHeight: "320px",
  width: "100%",
  height: "100%"
};

export default class VideoPreview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id:
        "videoJS" +
        this.props.name.charAt(0).toUpperCase() +
        this.props.name.slice(1)
    };
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    if (!this.props.fps) {
      return;
    }
    if (this.props.src) {
      videojs(this.state.id).src(this.props.src);
      videojs(this.state.id).currentTime(
        frameToSecs(this.props.frame, this.props.fps)
      );
      // let frames = extractFramesFromVideo(this.state.id, this.props.fps);
      // console.log(frames);
    }
  }

  componentDidUpdate() {
    if (
      (!this.props.frame && this.props.frame !== 0) ||
      !isFinite(this.props.frame) ||
      !this.props.fps
    )
      return;
    var player = videojs.getPlayer(this.state.id);
    player.currentTime(frameToSecs(this.props.frame, this.props.fps));
  }

  handleChange = event => {
    if (event.target.value > secsToFrame(this.props.end, this.props.fps)) {
      alert("Inputted frame bigger than last frame");
    }
    console.log("update");
    // var player = videojs.getPlayer(this.state.id);
    // player.currentTime(frameToSecs(event.target.value, this.props.fps));
    this.props.onChange(parseInt(event.target.value), this.props.name);

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
    // console.log("unmounting videopreview", this.state.id);
  }

  render() {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: 5,
          justifyContent: "space-around",
          width: "100%",
          height: "100%"
        }}
      >
        <VideoPlayer
          id={this.state.id}
          {...videoPreviewOptions}
          style={{ display: "flex", width: "100%", height: "100%" }}
        />
        {this.props.name.charAt(0).toUpperCase() + this.props.name.slice(1)}{" "}
        Frame
        <Input
          style={{ width: "100px" }}
          type="number"
          id={this.props.name}
          onChange={e => {
            this.handleChange(e);
          }}
          value={isFinite(this.props.frame) ? this.props.frame : 0}
          min={0}
          max={secsToFrame(this.props.end, this.props.fps)}
        ></Input>
        Approximate Time
        <Input
          style={{ width: "100px" }}
          type="number"
          id={this.props.name + "time"}
          disabled={true}
          value={
            this.props.fps
              ? parseFloat(frameToSecs(this.props.frame, this.props.fps))
              : 0
          }
          key={this.props.name + "time"}
          min={0}
          max={secsToFrame(this.props.end, this.props.fps)}
        ></Input>
      </div>
    );
  }
}

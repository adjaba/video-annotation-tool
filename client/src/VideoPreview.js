import React, { Component } from "react";
import VideoPlayer from "./VideoPlayer";
import videojs from "video.js";
import { frameToSecs } from "./utils";

var videoPreviewOptions = {
  autoplay: false,
  preload: "auto",
  height: 200
};

export default class VideoPreview extends Component {
  state = {
    time: 0,
    id:
      "videoJS" +
      this.props.name.charAt(0).toUpperCase() +
      this.props.name.slice(1)
  };

  componentDidUpdate() {
    if (this.props.src) {
      videojs(this.state.id).src(this.props.src);
    }
  }

  handleChange(e) {
    // this.setState({
    //   time: parseInt(e.target.value),
    // })
    // var player = videojs(this.state.id);
    // console.log(parseInt(e.target.value));
    // player.currentTime(parseInt(e.target.value));
  }
  render() {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: 5
        }}
      >
        <input
          type="number"
          id={this.props.name}
          onChange={e => {
            this.handleChange(e);
            this.props.onChange(e);
          }}
          key={this.props.inputKey}
        ></input>
        <VideoPlayer id={this.state.id} {...videoPreviewOptions} />
      </div>
    );
  }
}

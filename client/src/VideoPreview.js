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
    }
  }

  handleChange = event => {
    console.log("there");
    var player = videojs.getPlayer(this.state.id);
    this.setState({
      frame: parseInt(event.target.value)
    });
    player.currentTime(frameToSecs(event.target.value, 29.97));
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
          value={this.state.frame}
          key={this.props.inputKey}
          max={this.props.end}
        ></input>
        <VideoPlayer id={this.state.id} {...videoPreviewOptions} />
      </div>
    );
  }
}

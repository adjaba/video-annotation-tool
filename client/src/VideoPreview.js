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
    frame: 0,
    id:
      "videoJS" +
      this.props.name.charAt(0).toUpperCase() +
      this.props.name.slice(1)
  };

  shouldComponentUpdate(nextProps) {
    if (this.props.src != nextProps["src"]) {
      var player = videojs.getPlayer(this.state.id);
      player.src(nextProps["src"]);
      player.currentTime(frameToSecs(this.state.frame, 29.97));
      return true;
    }
    return true;
  }

  handleChange = event => {
    console.log("there");
    var player = videojs.getPlayer(this.state.id);
    this.setState({
      frame: parseInt(event.target.value)
    });
    player.currentTime(frameToSecs(event.target.value, 29.97));
  };

  componentWillReceiveProps(nextProps) {
    this.setState({ frame: nextProps.frame });
    var player = videojs.getPlayer(this.state.id);
    player.currentTime(frameToSecs(nextProps.frame, 29.97));
  }
  componentWillUnmount() {
    console.log("unmounting videopreview");
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

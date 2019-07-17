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

  handleChange = event => {
    var player = videojs.getPlayer(this.state.id);
    player.src(this.props.src);
    this.setState({
      time: parseInt(event.target.value)
    });
    player.currentTime(frameToSecs(event.target.value, 29.97));
  };

  // componentWillReceiveProps(nextProps){
  //     this.setState({time: nextProps.time})
  // }

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
          value={this.state.time}
          key={this.props.inputKey}
        ></input>
        <VideoPlayer id={this.state.id} {...videoPreviewOptions} />
      </div>
    );
  }
}

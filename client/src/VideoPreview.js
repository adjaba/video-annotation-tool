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
      time: this.props.time
    };
    this.id =
      "videoJS" +
      this.props.name.charAt(0).toUpperCase() +
      this.props.name.slice(1);
  }

  // when time changes
  componentDidUpdate(prevProps, prevState) {
    console.log("videopreview updated");
    if (prevState["src"] !== this.props.src) {
      videojs.getPlayer(this.id).src(this.props.src);
    }
    if (prevState !== this.state && this.state.time) {
      console.log("supposed to change screen");
      var player = videojs.getPlayer(this.id);
      console.log(player);
      console.log(
        this.props.fps ? frameToSecs(this.state.time, this.props.fps) : 0
      );
      console.log("before");
      console.log(player.currentTime());
      player.currentTime(
        this.props.fps ? frameToSecs(this.state.time, this.props.fps) : 0
      );
      console.log(player.currentTime());
      console.log(player.currentSource());
    }
  }

  handleChange = event => {
    this.setState({
      time: parseInt(event.target.value)
    });
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
        ></input>
        <VideoPlayer id={this.id} {...videoPreviewOptions} />
      </div>
    );
  }
}

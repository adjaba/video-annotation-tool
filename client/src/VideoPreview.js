import React, { Component } from "react";
import VideoPlayer from "./VideoPlayer";
import videojs from "video.js";
import { frameToSecs, secsToFrame } from "./utils";
import { Input, Button } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";

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

  /**
   * Set the source of video preview and the displayed frame to be that of the current frame.
   */
  componentDidMount() {
    if (!this.props.fps) {
      return;
    }
    if (this.props.src) {
      videojs(this.state.id).src(this.props.src);
      videojs(this.state.id).currentTime(
        frameToSecs(this.props.frame, this.props.fps)
      );
    }
  }

  shouldComponentUpdate(nextProps) {
    return this.props !== nextProps;
  }

  /**
   * Update displayed screen in preview.
   */
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

  /**
   * handleChange -> handler for frame change by user input
   *
   * Make sure that frame is within bounds (no need to check for negative since <Input> does not allow negative input)
   * Call propsOnChange, which updates everything from the Annotation App.
   */
  handleChange = event => {
    if (event.target.value > secsToFrame(this.props.end, this.props.fps)) {
      alert("Inputted frame bigger than last frame");
      return;
    }
    this.props.onChange(parseInt(event.target.value), this.props.name);
  };

  /**
   * handleIncrement -> handler for button increment in frame, expects either int input or string of int input
   */
  handleIncrement = increment => {
    increment = parseInt(increment);
    var currentVal = parseInt(document.getElementById(this.props.name).value);
    if (increment > 0) {
      this.props.onChange(
        parseInt(
          Math.min(
            secsToFrame(this.props.end, this.props.fps),
            currentVal + increment
          )
        ),
        this.props.name
      );
    } else {
      this.props.onChange(
        Math.max(0, currentVal - increment * -1),
        this.props.name
      );
    }
  };

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
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row"
          }}
        >
          <Button
            style={{ margin: 0 }}
            onClick={() => this.handleIncrement("-5")}
          >
            {" "}
            -5
          </Button>
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
          <Button style={{ margin: 0 }} onClick={() => this.handleIncrement(5)}>
            {" "}
            +5
          </Button>
        </div>
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

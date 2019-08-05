import React from "react";
import videojs from "video.js";
import { playbackRates } from "./utils";

export default class VideoPlayer extends React.Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    // instantiate Video.js
    this.player = videojs(
      this.videoNode,
      { ...this.props, playbackRates: playbackRates },
      function onPlayerReady() {
        this.getChild("bigPlayButton").on("click", function(event) {
          event.preventDefault();
          this.play();
        });

        this.on("toggleClick", function() {
          if (this.paused()) {
            this.play();
          } else {
            this.pause();
          }
        });
      }
    );
  }

  // destroy player on unmount
  componentWillUnmount() {
    if (this.player) {
      this.player.dispose();
    }
  }

  // wrap the player in a div with a `data-vjs-player` attribute
  // so videojs won't create additional wrapper in the DOM
  // see https://github.com/videojs/video.js/pull/3856
  render() {
    return (
      <div>
        <div data-vjs-player>
          <video
            ref={node => (this.videoNode = node)}
            className="video-js"
          ></video>
        </div>
      </div>
    );
  }
}

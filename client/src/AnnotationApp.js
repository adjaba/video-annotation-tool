import React, { Component } from "react";
import "./App.css";
import VideoPlayer from "./VideoPlayer";
import "video.js/dist/video-js.css";
import videojs from "video.js";
import Event from "./Event";
import VideoPreview from "./VideoPreview";
import { frameToSecs, secsToFrame } from "./utils";
import ScenesActions from "./ScenesActions";
import update from "immutability-helper";
import { Hotkeys, GlobalHotKeys } from "react-hotkeys";
import {
  Header,
  Form,
  Button,
  Icon,
  List,
  Grid,
  Dimmer,
  Segment,
  Input,
  Dropdown,
  Divider
} from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
// import { init, getMediaInfo } from "./js/MediaInfoPort"
// import {parseFile} from './FPSpage.js'

import uniqueId from "lodash/uniqueId";
import { EventEmitter } from "events";
import { isThisSecond } from "date-fns";
import { callbackify } from "util";
import { timer } from "rxjs";

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
// var mediaInfo = require('mediainfo');
// var parser = require('xml2json');
// var processing = false;

var videoJsOptions = {
  autoplay: true,
  controls: true,
  preload: "none",
  height: 400
};

var videoPreviewOptions = {
  autoplay: false,
  preload: "auto",
  height: 200
};

const keyMap = {
  UNDO: "ctrl+z",
  REDO: ["ctrl+y", "shift+ctrl+z"],
  SAVE: "ctrl+s"
};

// from videojs-markers
// const defaultSetting = {
//   markerStyle:{
//     'width': '7px',
//     'border-radius': '30%',
//     'background-color': red,
//   },
//   markerTip: {
//     display: true,
//     text: function(marker){
//       return marker.text
//     },
//     time: function(marker){
//       return marker.time
//     },
//   },
// }

class AnnotationApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTime: 0,
      videoName: null,
      saved: true,
      videoSrc: null,
      json: null,
      jsonName: null,
      history: [],
      historyIndex: 0,
      segmentStart: null,
      segmentEnd: null,
      segmentIndex: null,
      segmentEvent: null,
      videoEndSecs: 0,
      visibleMenu: false,
      visibleScenesActions: false
    };
    this.playSelectedFile = this.playSelectedFile.bind(this);
    this.jumpTo = this.jumpTo.bind(this);
    this.parseJSONInput = this.parseJSONInput.bind(this);
    this.parseJSONBlank = this.parseJSONBlank.bind(this);
    // this.frameToSecs = this.frameToSecs.bind(this);
    this.playSection = this.playSection.bind(this);
    this.videoPreviewChange = this.videoPreviewChange.bind(this);
    this.export = this.export.bind(this);
    this.setScenesActions = this.setScenesActions.bind(this);
    this.setEvent = this.setEvent.bind(this);
    this.undo = this.undo.bind(this);
    this.redo = this.redo.bind(this);
    this.addEvent = this.addEvent.bind(this);
    this.deleteEvent = this.deleteEvent.bind(this);
    this.deleteEventFromSidebar = this.deleteEventFromSidebar.bind(this);
    this.addToDatabase = this.addToDatabase.bind(this);
    this.fetchFromDatabase = this.fetchFromDatabase.bind(this);
    this.markers = this.markers.bind(this);
    this.id = 0;
    this.events = {};
    this.eventpool = {};
    this.scenes = {}; // complete scenes
    this.scenepool = {}; // undeleted scenes (for options)
    this.actions = {};
    this.actionpool = {}; // undeleted events (for options)
    // this.parseFile = this.parseFile.bind(this);
    this.initialize = this.initialize.bind(this);
  }

  handlers = {
    UNDO: () => this.undo(),
    REDO: () => this.redo(),
    SAVE: () => this.saveVideoPreview()
  };

  async componentDidMount() {
    try {
      const eventsR = await (await fetch("/api/events")).json();
      console.log("SUCCESS event fetch", eventsR);
      eventsR["message"].forEach(obj => {
        var { id, eventName, deleted } = obj;
        this.events[id] = eventName;

        if (!+deleted) {
          this.eventpool[id] = eventName;
        }
      });
      console.log(this.events);
    } catch (error) {
      console.log(error, "OH NO");
    }
    try {
      const actionsR = await (await fetch("/api/actions")).json();
      console.log("SUCCESS action fetch", actionsR);
      actionsR["message"].forEach(obj => {
        var { id, actionName, deleted } = obj;
        this.actions[id] = actionName;

        if (!+deleted) {
          this.actionpool[id] = actionName;
        }
      });
      console.log(this.actions);
    } catch (error) {
      console.log(error, "OH NO");
    }
    try {
      const scenesR = await (await fetch("/api/scenes")).json();
      console.log("SUCCESS scene fetch", scenesR);
      scenesR["message"].forEach(obj => {
        var { id, sceneName, deleted } = obj;
        this.scenes[id] = sceneName;

        if (!+deleted) {
          this.scenepool[id] = sceneName;
        }
      });
      console.log(this.scenes);
      console.log(this.scenepool);
    } catch (error) {
      console.log(error, "OH NO");
    }
  }

  /**
   * componentDidUpdate - used to set up state given video and json
   * @param {*} prevProps
   * @param {*} prevState
   */
  componentDidUpdate(prevProps, prevState) {
    // if there is no video and json was blank ("" or null)
    // this scenario would occur after changing the video for a previously blank json
    if (!this.state.videoName && this.state.jsonName === "") {
      this.setState({
        json: null,
        history: []
      });
    }

    const fps =
      this.state.history.length > 0
        ? this.state.history[
            this.state.history.length - 1 - this.state.historyIndex
          ][0]["fps"] || null
        : null;

    if (
      prevState["segmentStart"] !== this.state.segmentStart ||
      prevState["segmentEnd"] !== this.state.segmentEnd
    ) {
      const player = videojs.getPlayer("videoJS");

      // if player has not loaded metadata yet, wait before running
      if (isNaN(player.duration())) {
        player.one("loadedmetadata", () => {
          if (fps) {
            this.markers(player, [
              {
                time: frameToSecs(this.state.segmentStart, fps),
                text: "start"
              },
              { time: frameToSecs(this.state.segmentEnd, fps), text: "end" }
            ]);
          }
        });
      } else {
        if (fps) {
          this.markers(player, [
            { time: frameToSecs(this.state.segmentStart, fps), text: "start" },
            { time: frameToSecs(this.state.segmentEnd, fps), text: "end" }
          ]);
        }
      }
    }
  }

  markers(player, marklist) {
    console.log(marklist, player.duration());
    var playheadWell = document.getElementsByClassName(
      "vjs-progress-holder vjs-slider"
    )[0];
    var elements = playheadWell.getElementsByClassName("vjs-marker");
    while (elements[0]) {
      playheadWell.removeChild(elements[0]);
    }
    // console.log(marklist);
    marklist.forEach((marker, i) => {
      var elem = document.createElement("div");
      elem.className = "vjs-marker";
      elem.id = "mk" + i;
      elem.style.left = (marker.time / player.duration()) * 100 + "%";
      playheadWell.appendChild(elem);
    });
  }

  async fetchFromDatabase(videoName) {
    console.log("fetchFromDatabase", videoName);

    try {
      await (await fetch("/api/start/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          videoName
        })
      }))
        .json()
        .then(message => {
          // console.log(message);
          const { id, currentJson } = message["message"][0];
          this.id = id;
          // console.log("MY ID", this.id);
          if (currentJson) {
            const r = window.confirm(
              "You have previously saved work. Restore?"
            );
            if (r) {
              this.setState(JSON.parse(currentJson));
            }
          }
        });
      // alert("MY ID", this.id);
      // alert("MESSAGE", message[]);
    } catch (err) {
      console.log(err);
    }
    // await fetch("/api/start/", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json"
    //   },
    //   body: JSON.stringify({
    //     videoName,
    //   })
    // }).then((id) => {
    //   return id.json()}).then(id => {console.log(id); this.id = id;});
  }

  async addToDatabase() {
    const videoName = this.state.videoName;
    const jsonName = this.state.jsonName;
    const id = this.id;

    const currentJson = update(this.state, { $unset: ["videoSrc"] });
    try {
      const message = await (await fetch("/api/save/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id: id,
          videoName,
          jsonName,
          currentJson
        })
      })).json();
      const newId = message["message"];
      if (!id) {
        this.id = newId;
      }
    } catch (err) {
      console.log(err);
    }
  }

  /**
   * Initialize state given video or json /user/ inputs.
   *
   * If video or json changes: //TODO: is this ever not true in this function?
   *  Check if json and video match
   *    If no, send alert
   *    If yes, proceed with resetting state
   *
   */
  initialize(
    videoName = this.state.videoName,
    videoSrc = this.state.videoSrc,
    segmentIndex = this.state.segmentIndex,
    json = this.state.json,
    jsonName = this.state.jsonName
  ) {
    if (videoName !== this.state.videoName || json !== this.state.json) {
      console.log(this.state.jsonName === "", this.state.jsonName);
      if (videoName && json) {
        // if video and json match
        console.log("json and video present and change detected");
        if (Object.keys(json["database"]).indexOf(videoName) >= 0) {
          console.log("json and video match");
          this.setState({
            saved: true,
            visibleMenu: true,
            history: [[json["database"][videoName], segmentIndex]],
            historyIndex: 0
          });
          // } else if (this.state.jsonName === "") {
          //   // if json was generated from before do nothing until new json is generated
        } else {
          console.log("clearing history");
          // if not match and jsonName is blank, this means new video that needs new blank
          alert(
            "The video and json do not match. Please wait to edit from scratch or upload the correct json file. "
          );
          segmentIndex = null;
          this.setState({
            videoEndSecs: null,
            // segmentIndex: null,
            history: [],
            json: json
          });
        }
      } else {
        segmentIndex = null;
        this.setState({
          videoEndSecs: null,
          // segmentIndex: null,
          history: []
        });
      }
    } else {
      alert("THIS HAPPENS???");
    }

    this.setState({
      videoName,
      videoSrc,
      segmentIndex,
      json,
      jsonName
    });
  }

  // on video upload
  playSelectedFile(event) {
    var file = event.target.files[0];
    const player = videojs.getPlayer("videoJS");

    if (!file) {
      this.initialize(null, null, null);
      this.setState({
        videoEndSecs: null
      });
      // this.setState({
      //   videoName: null,
      //   videoSrc: null,
      //   segmentIndex: null,
      //   videoEndSecs: null
      // });
      player.reset();
      return;
    }

    // // if input changed but there was a previous videoSrc
    // // TODO: generate unique segmentIndex per new upload of video, just to reset videopreview and list
    // if (this.state.videoSrc) {
    //   // segmentIndex = this.state.segmentIndex + '0';
    // }

    if (player.canPlayType(file.type) === "") {
      alert(
        "Cannot play video with type " +
          file.type +
          ", please select a different video or use a different browser."
      );
      return;
    }

    var fileURL = URL.createObjectURL(file);
    player.src({
      src: fileURL,
      type: file.type
    });

    this.fetchFromDatabase(file.name.substring(0, file.name.lastIndexOf(".")));
    this.initialize(
      file.name.substring(0, file.name.lastIndexOf(".")),
      {
        src: fileURL,
        type: file.type
      },
      null
    );
    // this.setState({
    //   videoName: file.name.substring(0, file.name.lastIndexOf(".")),
    //   videoSrc: {
    //     src: fileURL,
    //     type: file.type
    //   },
    //   segmentIndex: null
    // });

    player.on("loadedmetadata", () => {
      this.setState({
        videoEndSecs: player.duration()
      });
    });

    player.on("timeupdate", () => {
      this.setState({
        currentTime: player.currentTime()
      });
    });
  }

  parseJSONInput(event) {
    if (!event.target.files[0]) {
      // this.setState({
      //   json: null
      // });
      this.initialize(
        this.state.videoName,
        this.state.videoSrc,
        this.state.segmentIndex,
        null
      );
      return;
    }

    var reader = new FileReader();
    reader.onload = event => {
      var json = JSON.parse(event.target.result);
      // TODO: add more to ensure correct formatting (ex: annotations)
      if (!("database" in json)) {
        alert("Wrong format, please upload new json.");
        var jsonUpload = document.getElementById("input_json");
        jsonUpload.click();
        return;
      }
      this.initialize(
        this.state.videoName,
        this.state.videoSrc,
        this.state.segmentIndex,
        json
      );
      // this.setState({
      //   json: json
      // });
    };

    reader.readAsText(event.target.files[0]);

    this.setState({
      jsonName: event.target.files[0].name.substring(
        0,
        event.target.files[0].name.lastIndexOf(".")
      )
    });
  }

  parseJSONBlank(value) {
    // when json and video don't match or when there's no uploaded json
    if (
      !this.state.json ||
      Object.keys(this.state.json["database"]).indexOf(this.state.videoName) < 0
    ) {
      console.log("replacing blank bwahahaha");
      this.initialize(
        this.state.videoName,
        this.state.videoSrc,
        this.state.segmentIndex,
        JSON.parse(value),
        "generated"
      );
    }
  }

  /**
   * playSection - plays video from this.state.segmentStart to this.state.segmentEnd if the latter is bigger than the former
   */

  //TODO: figure out whether document.getElementById("start") can be replaced by this.state.segmentStart, etc.
  playSection() {
    var myPlayer = videojs.getPlayer("videoJS");
    var startInput = parseInt(document.getElementById("start").value);
    var endInput = parseInt(document.getElementById("end").value);
    var start =
      frameToSecs(
        startInput,
        this.state.history[
          this.state.history.length - 1 - this.state.historyIndex
        ][0]["fps"]
      ) || 0;
    var end =
      frameToSecs(
        endInput,
        this.state.history[
          this.state.history.length - 1 - this.state.historyIndex
        ][0]["fps"]
      ) || myPlayer.duration();

    if (end > start) {
      myPlayer.currentTime(start);
      var pauseFunc = function(e) {
        if (myPlayer.currentTime() >= end) {
          console.log("paused", myPlayer.currentTime(), end);
          myPlayer.pause();
          myPlayer.off("timeupdate", pauseFunc);
        }
      };
      myPlayer.on("timeupdate", pauseFunc);
      myPlayer.play();
    } else {
      alert("end time should be bigger than start time");
      return;
    }
  }

  /**
   * jumpTo - plays video from this.state.segmentStart to this.state.segmentEnd if the latter is bigger than the former
   */
  jumpTo() {
    var myPlayer = videojs.getPlayer("videoJS");
    var startInput = parseInt(document.getElementById("start").value);
    var endInput = parseInt(document.getElementById("end").value);
    var start =
      frameToSecs(
        startInput,
        this.state.history[
          this.state.history.length - 1 - this.state.historyIndex
        ][0]["fps"]
      ) || 0;
    var end =
      frameToSecs(
        endInput,
        this.state.history[
          this.state.history.length - 1 - this.state.historyIndex
        ][0]["fps"]
      ) || myPlayer.duration();

    myPlayer.currentTime(start);

    if (end > start) {
      myPlayer.on("timeupdate", function(e) {
        if (myPlayer.currentTime() >= end) {
          myPlayer.pause();
          myPlayer.off("timeupdate");
        }
      });
    } else {
      alert("Please set end frame to be bigger than start frame.");
    }

    myPlayer.play();
  }

  /**
   * saveMetadata - sort annotations in metadata and appropriately maintain history (last 20)
   * @param {*} metadata - metadata to be sorted and added onto history
   * @param {*} segmentIndex - segmentIndex is the current index of the event we want after save (for sorting in add event and time change)
   * @param {*} segmentStart - segmentStart is the start frame for the event we want after save
   * @param {*} segmentEnd - segmentEnd is the end frame for the event we want after save
   *
   * segmentIndex, segmentStart, segmentEnd used to move focus to a different event
   *  for addEvent - this is so that when addEvent is clicked we see the new event ready to be edited
   *  for deleteEvent - this is so that when we delete an event we go back to empty slate and select a new event for editing
   */
  async saveMetadata(
    metadata,
    segmentIndex = this.state.segmentIndex,
    segmentStart = this.state.segmentStart,
    segmentEnd = this.state.segmentEnd
  ) {
    // sorting metadata by time
    metadata = update(metadata, {
      annotations: {
        $apply: arr =>
          arr.sort(
            (a, b) =>
              a["segment"][0] - b["segment"][0] ||
              a["segment"][1] - b["segment"][1]
          )
      }
    });

    // getting new index after sort
    var newIndex =
      segmentIndex > 0 || segmentIndex === 0
        ? metadata["annotations"].reduce((acc, curr, index) => {
            if (curr["segmentIndex"] === segmentIndex) {
              acc.push(index);
            }
            return acc;
          }, [])[0]
        : null;

    // set segmentIndex so that it matches index in array
    metadata = update(metadata, {
      annotations: {
        $apply: arr => {
          return arr.map((event, index) => {
            return update(event, { segmentIndex: { $set: index } });
          });
        }
      }
    });

    // push this new metadata to history
    var history = update(
      this.state.history.slice(
        0,
        this.state.history.length - this.state.historyIndex
      ),
      { $push: [[metadata, newIndex]] }
    );

    // only keep the last 20 saved metadata
    history = history.slice(Math.max(history.length - 20, 0));

    await this.setState({
      saved: true,
      history: history,
      historyIndex: 0,
      segmentIndex: newIndex,
      segmentStart: segmentStart,
      segmentEnd: segmentEnd
    });
    this.addToDatabase();
  }

  /**
   * addEvent
   *
   * adds new event at the end of event list
   * default start frame is 1 more than end frame of last event in list
   * default end frame is end of video
   */
  addEvent() {
    const newIndex = this.state.history[
      this.state.history.length - 1 - this.state.historyIndex
    ][0]["annotations"].length;

    const videoEnd = secsToFrame(
      this.state.videoEndSecs,
      this.state.history[
        this.state.history.length - 1 - this.state.historyIndex
      ][0]["fps"]
    );

    const segmentStart =
      newIndex < 1
        ? 0
        : Math.min(
            this.state.history[
              this.state.history.length - 1 - this.state.historyIndex
            ][0]["annotations"][newIndex - 1]["segment"][1] + 1,
            videoEnd
          );

    var metadata = update(
      this.state.history[
        this.state.history.length - 1 - this.state.historyIndex
      ][0],
      {
        annotations: {
          $push: [
            {
              segmentIndex: newIndex,
              labelEvent: null,
              labelEventIdx: null,
              segment: [segmentStart, videoEnd],
              labelScene: [],
              labelSceneIndex: [],
              numberOfScenes: 0,
              labelAction: [],
              labelActionIndex: [],
              numberOfActions: []
            }
          ]
        }
      }
    );

    this.saveMetadata(metadata, newIndex, segmentStart, videoEnd);
    this.setState({
      visibleScenesActions: true
    });
  }

  deleteEventFromSidebar(segmentIndex) {
    if (segmentIndex === this.state.segmentIndex) {
      this.deleteEvent(segmentIndex);
    } else {
      var metadata = update(
        this.state.history[
          this.state.history.length - 1 - this.state.historyIndex
        ][0],
        {
          annotations: {
            $splice: [[segmentIndex, 1]]
          }
        }
      );

      this.saveMetadata(metadata);
    }
  }

  deleteEvent(segmentIndex) {
    var metadata = update(
      this.state.history[
        this.state.history.length - 1 - this.state.historyIndex
      ][0],
      {
        annotations: {
          $splice: [[segmentIndex, 1]]
        }
      }
    );

    this.saveMetadata(metadata, null, null, null);
  }

  undo() {
    var historyIndex = this.state.historyIndex;
    historyIndex = Math.min(this.state.history.length - 1, historyIndex + 1);
    this.setState({
      historyIndex: historyIndex,
      segmentIndex: this.state.history[
        this.state.history.length - 1 - historyIndex
      ][1]
    });
  }

  redo() {
    var historyIndex = this.state.historyIndex;
    historyIndex = Math.max(0, historyIndex - 1);
    this.setState({
      historyIndex: historyIndex,
      segmentIndex: this.state.history[
        this.state.history.length - 1 - historyIndex
      ][1]
    });
  }

  saveVideoPreview() {
    if (this.state.segmentEnd < this.state.segmentStart) {
      alert("End frame cannot be smaller than start frame");
      return;
    }

    var currentMetadata = this.state.history[
      this.state.history.length - 1 - this.state.historyIndex
    ][0];

    // if nothing changed don't do anything
    if (
      currentMetadata["annotations"][this.state.segmentIndex]["segment"][0] ===
        this.state.segmentStart &&
      currentMetadata["annotations"][this.state.segmentIndex]["segment"][1] ===
        this.state.segmentEnd
    ) {
      this.setState({
        saved: true
      });
      return;
    }

    var metadata = update(currentMetadata, {
      annotations: {
        [this.state.segmentIndex]: {
          segment: {
            $set: [this.state.segmentStart, this.state.segmentEnd]
          }
        }
      }
    });
    this.saveMetadata(metadata);
  }

  export() {
    // TODO: check if saved right now
    if (!this.state.saved) {
      const r = window.confirm(
        "You may have unsaved changes. Click OK to export the last saved version. Click cancel to cancel export."
      );
      if (!r) return;
    }

    var metadata = this.state.history[
      this.state.history.length - 1 - this.state.historyIndex
    ][0];

    var json = this.state.json;
    json["database"][this.state.videoName] = metadata;

    var dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(json, null, 2));

    var dlAnchorElem = document.createElement("a");
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute(
      "download",
      this.state.jsonName + "_changed.json"
    );
    dlAnchorElem.click();
  }

  setScenesActions(items, mode) {
    // console.log(
    //   "triggered" + this.state.segmentIndex + mode + items.toString()
    // );
    var metadata;
    if (mode === "scenes") {
      metadata = update(
        this.state.history[
          this.state.history.length - 1 - this.state.historyIndex
        ][0],
        {
          annotations: {
            [this.state.segmentIndex]: {
              labelSceneIndex: { $set: items }
            }
          }
        }
      );
      metadata = update(metadata, {
        annotations: {
          [this.state.segmentIndex]: {
            labelScene: { $set: items.map(scene => this.scenes[scene]) }
          }
        }
      });

      metadata = update(metadata, {
        annotations: {
          [this.state.segmentIndex]: {
            numberOfScenes: { $set: items.length }
          }
        }
      });
    } else if (mode === "actions") {
      metadata = update(
        this.state.history[
          this.state.history.length - 1 - this.state.historyIndex
        ][0],
        {
          annotations: {
            [this.state.segmentIndex]: {
              labelActionIndex: { $set: items }
            }
          }
        }
      );
      metadata = update(metadata, {
        annotations: {
          [this.state.segmentIndex]: {
            labelAction: { $set: items.map(action => this.actions[action]) }
          }
        }
      });

      metadata = update(metadata, {
        annotations: {
          [this.state.segmentIndex]: {
            numberOfActions: { $set: items.length }
          }
        }
      });
    }
    this.saveMetadata(metadata);
  }

  videoPreviewChange(frame, name) {
    if (name === "start") {
      this.setState({ saved: false, segmentStart: frame });
    } else if (name === "end") {
      this.setState({ saved: false, segmentEnd: frame });
    }
  }

  setEvent(value) {
    var metadata = update(
      this.state.history[
        this.state.history.length - 1 - this.state.historyIndex
      ][0],
      {
        annotations: {
          [this.state.segmentIndex]: {
            labelEvent: { $set: this.events[value] }
          }
        }
      }
    );
    metadata = update(metadata, {
      annotations: {
        [this.state.segmentIndex]: { labelEventIdx: { $set: value } }
      }
    });
    this.saveMetadata(metadata);
  }

  renderEvents() {
    // TODO: Stop frequent renderEvents?
    // console.log("EVENTS", this.state.history);
    return this.state.history.length > 0
      ? "annotations" in
        this.state.history[
          this.state.history.length - 1 - this.state.historyIndex
        ][0]
        ? this.state.history[
            this.state.history.length - 1 - this.state.historyIndex
          ][0]["annotations"].map((prop, i) => (
            <Event
              key={i}
              {...prop}
              index={i}
              onClick={() => {
                if (!this.state.saved) {
                  const r = window.confirm(
                    "You have unsaved changes. Navigating to another event will discard these unsaved changes. Continue?"
                  );
                  if (!r) {
                    return;
                  }
                  this.setState({
                    saved: true
                  });
                }
                this.setState({
                  segmentStart: prop["segment"][0],
                  segmentEnd: prop["segment"][1],
                  segmentIndex: prop["segmentIndex"],
                  visibleScenesActions: true
                });
              }}
              onDeleteClick={e => {
                this.deleteEventFromSidebar(prop["segmentIndex"]);
                e.stopPropagation();
              }}
              focus={this.state.segmentIndex}
            />
          ))
        : null
      : null;
  }

  render() {
    const ready = this.state.json && this.state.videoName;
    const editReady =
      this.state.segmentIndex > 0 || this.state.segmentIndex === 0;
    const active = !ready || !editReady;
    const content = !ready ? (
      <div>
        <Header as="h2" inverted>
          Please complete uploading the video. If you would like to resume
          editing from a JSON, please also upload the JSON file.
        </Header>
      </div>
    ) : !editReady ? (
      <div>
        <Header as="h2" inverted>
          Click on an event on the sidebar to start editing.
        </Header>
      </div>
    ) : (
      <div>
        <Header as="h2" inverted>
          Something went wrong.
        </Header>
      </div>
    );

    const currentMetadata = this.state.history[
      this.state.history.length - 1 - this.state.historyIndex
    ]
      ? this.state.history[
          this.state.history.length - 1 - this.state.historyIndex
        ][0]
      : null;

    const thereAreEvents = currentMetadata
      ? currentMetadata["annotations"].length > 0
      : false;

    return (
      <div style={{ display: "flex", height: "100vh", flexDirection: "row" }}>
        <GlobalHotKeys keyMap={keyMap} handlers={this.handlers} />
        <div
          style={{
            display: this.state.visibleMenu ? "flex" : "none",
            flexDirection: "column",
            padding: "1em",
            borderRight: "1px solid #ccc",
            height: "100%",
            flex: 3,
            maxWidth: 300,
            backgroundColor: "#fff",
            minWidth: "max-content",
            maxWidth: "300px"
          }}
        >
          <Header size="large" style={{ flex: "0 0 auto" }}>
            Events
            <Icon
              size="small"
              name="angle left"
              style={{ float: "right", marginRight: 0 }}
              onClick={() => this.setState({ visibleMenu: false })}
            />
          </Header>
          <Button
            fluid
            positive
            icon
            labelPosition="left"
            onClick={this.addEvent}
            disabled={Object.keys(this.state.history).length === 0} //only have history with uploaded json and vid matching
          >
            {" "}
            <Icon name="add" size="small" />
            Add Event
          </Button>
          <div style={{ flex: 1, overflowY: "auto" }}>
            <List divided selection>
              {this.renderEvents()}
            </List>
          </div>
          <Button
            icon
            labelPosition="left"
            onClick={this.export}
            disabled={Object.keys(this.state.history).length === 0}
          >
            <Icon name="download" />
            Export
          </Button>
        </div>
        <div
          style={{
            height: "auto",
            padding: "1em 0.5em",
            borderRight: "1px solid #ccc",
            display: this.state.visibleMenu ? "none" : "flex",
            flexDirection: "column",
            maxWidth: "50px",
            alignItems: "center"
          }}
        >
          <Icon
            size="large"
            name="bars"
            onClick={() => this.setState({ visibleMenu: true })}
            style={{ marginRight: 0, marginBottom: "10px" }}
          />
          <Button
            size="small"
            icon
            positive
            onClick={this.addEvent}
            disabled={Object.keys(this.state.history).length === 0}
            style={{ marginRight: 0, marginBottom: "10px" }}
          >
            <Icon name="add" />
          </Button>
          <div style={{ display: "flex", flex: 1 }}></div>
          <Button
            size="small"
            icon
            onClick={this.export}
            disabled={Object.keys(this.state.history).length === 0}
            style={{ marginRight: 0 }}
          >
            <Icon name="download" />
          </Button>
        </div>
        <div
          style={{
            display:
              editReady && thereAreEvents && this.state.visibleScenesActions
                ? "flex"
                : "none",
            flex: 8,
            flexDirection: "column",
            height: "100%",
            borderLeft: "1px solid #ddd",
            borderRight: "1px solid #ddd",
            minWidth: "max-content"
          }}
        >
          <div
            style={{
              display: "flex",
              height: "38px",
              width: "100%",
              borderTop: "1px #222426",
              alignItems: "center"
            }}
          >
            <Header
              as="h4"
              floated="left"
              size="large"
              style={{ padding: "5px 10px", margin: 0 }}
            >
              Event {this.state.segmentIndex}
            </Header>
            <div style={{ flex: 1 }} />
            <Button
              negative
              size="small"
              icon
              labelPosition="left"
              onClick={() => this.deleteEvent(this.state.segmentIndex)}
              disabled={Object.keys(this.state.history).length === 0} //only have history with uploaded json and vid matching
              style={{ float: "right", margin: "5px 10px" }}
            >
              {" "}
              <Icon name="remove circle" size="small" />
              Delete Event
            </Button>
            <Icon
              size="big"
              name="angle left"
              style={{ float: "right", marginRight: 0 }}
              onClick={() => this.setState({ visibleScenesActions: false })}
            />
            {/* <Button
              size="small"
              icon="eye"
              labelPosition="left"
              onClick={() => this.deleteEvent(this.state.segmentIndex)}
              disabled={Object.keys(this.state.history).length === 0} //only have history with uploaded json and vid matching
              style={{ float: "right", margin: "5px 10px" }}
            >
              {" "}
              <Icon name="remove circle" size="small" />
            </Button> */}
          </div>
          <ScenesActions
            key={this.state.segmentIndex + "scenes"}
            mode="scenes"
            items={
              editReady && thereAreEvents
                ? currentMetadata["annotations"][this.state.segmentIndex][
                    "labelSceneIndex"
                  ]
                : []
            }
            style={{
              flex: 1,
              padding: "5px",
              borderBottom: "1px solid #ddd",
              borderTop: "1px solid #ddd"
            }}
            source={this.scenepool}
            onChange={this.setScenesActions}
          />
          {/* </Grid.Column>
          <Grid.Column> */}
          <ScenesActions
            key={this.state.segmentIndex + "actions"}
            mode="actions"
            items={
              editReady && thereAreEvents
                ? currentMetadata["annotations"][this.state.segmentIndex][
                    "labelActionIndex"
                  ]
                : []
            }
            source={this.actionpool}
            style={{ flex: 1, padding: "5px" }}
            onChange={this.setScenesActions}
          />
        </div>
        <div
          style={{
            display: "flex",
            flex: "24 1 0",
            flexDirection: "column",
            height: "100%",
            backgroundColor: "#ddd",
            alignItems: "center",
            justifyContent: "space-between"
            // overflowX: "auto"
          }}
        >
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
          <div
            style={{
              display: "flex",
              flex: "0 0 auto",
              width: "100%",
              flexDirection: "column",
              alignItems: "center",
              paddingBottom: "10px",
              height: "454px"
            }}
          >
            <div
              style={{ display: "flex", flexDisplay: "row", padding: "5px" }}
            >
              <Button
                primary
                onClick={() => document.getElementById("input_video").click()}
              >
                Upload video
              </Button>
              <input
                style={{ display: "none" }}
                id="input_video"
                type="file"
                accept="video/*"
                onChange={e => {
                  // this.setState({ video: e.target.value });
                  this.playSelectedFile(e);
                }}
              />
              <Button
                color="grey"
                onClick={() => document.getElementById("input_json").click()}
              >
                Upload JSON
              </Button>
              <input
                style={{ display: "none" }}
                id="input_json"
                type="file"
                accept=".json, application/json"
                onChange={e => {
                  this.parseJSONInput(e);
                }}
              />
              <input
                style={{ display: "none" }}
                id="input_json_blank"
                type="text"
                onChange={e => {
                  console.log(" you have reached me");
                  this.parseJSONBlank(e.target.value);
                }}
              />
            </div>
            {/* below this.state.video should be a prop passed on from project page or maybe not*/}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center"
              }}
            >
              <VideoPlayer id="videoJS" {...videoJsOptions} />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  backgroundColor: "#fff",
                  padding: "5px"
                }}
              >
                {/* {"CURRENT TIME:"}{this.state.currentTime}<br/> */}
                <h4 style={{ margin: "5px" }}>
                  Video Name: {this.state.videoName}
                </h4>
                <h4 style={{ margin: "5px" }}>
                  JSON Name: {this.state.jsonName}
                </h4>
                <h4 style={{ margin: "5px" }}>
                  Current Frame:
                  {currentMetadata
                    ? secsToFrame(
                        this.state.currentTime,
                        currentMetadata["fps"]
                      )
                    : 0}
                </h4>
                {/*                   
                <br/> */}
                <Button
                  primary
                  compact
                  disabled={!editReady}
                  onClick={() => {
                    if (!currentMetadata) return;
                    this.setState({
                      saved: false,
                      segmentStart: secsToFrame(
                        this.state.currentTime,
                        currentMetadata["fps"]
                      )
                    });
                  }}
                  style={{ marginBottom: "5px" }}
                >
                  Send to start
                </Button>
                <Button
                  compact
                  color="grey"
                  disabled={!editReady}
                  onClick={() => {
                    if (!currentMetadata) return;
                    this.setState({
                      saved: false,
                      segmentEnd: secsToFrame(
                        this.state.currentTime,
                        currentMetadata["fps"]
                      )
                    });
                  }}
                >
                  Send to end
                </Button>
              </div>
            </div>
          </div>
          {/* <Grid stackable columns = {2}>
            <Grid.Column> */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              backgroundColor: "#fff",
              flex: 1
            }}
          >
            <Dimmer.Dimmable
              blurring
              dimmed={active}
              style={{ height: "100%" }}
            >
              <Dimmer active={active} content={content} />
              <Divider style={{ margin: 0 }} />
              {/* <Grid columns = {3} divided style={{
                  display: "flex",
                  flex: 1,
                  flexDirection: "row"
                }}> */}
              <div
                // className="container"
                style={{
                  display: "flex",
                  flex: 1,
                  flexDirection: "row",
                  flexWrap: "wrap",
                  alignItems: "center",
                  overflowY: "auto",
                  overflowX: "auto",
                  height: "calc(100vh - 455px)",
                  alignContent: "flex-start"
                }}
              >
                {/* <Grid.Column> */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    width: "100%",
                    paddingBottom: "5px",
                    height: "100%"
                    // borderBottom: "1px solid #ddd"
                  }}
                >
                  <div style={{ display: "block", padding: "5px 10px" }}>
                    <b>Type: </b>
                    <Dropdown
                      key={this.state.segmentIndex}
                      search
                      selection
                      onChange={(e, { value }) => this.setEvent(value)}
                      options={Object.keys(this.eventpool).map(id =>
                        Object({
                          key: id,
                          text: this.eventpool[id],
                          value: id
                        })
                      )}
                      defaultValue={
                        editReady && thereAreEvents
                          ? this.events[
                              currentMetadata["annotations"][
                                this.state.segmentIndex
                              ]["labelEventIdx"]
                            ] //TODO: labelEventIndex?
                          : null
                      }
                    ></Dropdown>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flex: 1,
                      flexDirection: "row",
                      height: "100%",
                      alignItems: "flex-start",
                      justifyContent: "space-around"
                    }}
                  >
                    <VideoPreview
                      key={
                        this.state.videoName + this.state.segmentIndex + "start"
                      }
                      name="start"
                      frame={editReady ? this.state.segmentStart : 0}
                      onChange={this.videoPreviewChange}
                      fps={currentMetadata ? currentMetadata["fps"] : null}
                      src={this.state.videoSrc}
                      end={this.state.videoEndSecs}
                    />
                    <VideoPreview
                      key={
                        this.state.videoName + this.state.segmentIndex + "end"
                      }
                      name="end"
                      frame={
                        editReady
                          ? this.state.segmentEnd
                          : secsToFrame(
                              this.state.videoEndSecs,
                              currentMetadata ? currentMetadata["fps"] : 0
                            ) || 0
                      }
                      onChange={this.videoPreviewChange}
                      fps={currentMetadata ? currentMetadata["fps"] : null}
                      src={this.state.videoSrc}
                      end={this.state.videoEndSecs}
                    />
                    <div
                      style={{
                        display: "flex",
                        flex: 0,
                        flexDirection: "column"
                      }}
                    >
                      <Button
                        primary
                        content="Play section"
                        icon="play"
                        labelPosition="left"
                        onClick={this.playSection}
                        style={{ marginTop: "5px" }}
                      />
                      <Button
                        color="grey"
                        icon
                        labelPosition="left"
                        onClick={e => {
                          this.saveVideoPreview();
                        }}
                        style={{ marginTop: "5px" }}
                      >
                        <Icon name="save" />
                        Apply frames
                      </Button>
                      <Button
                        negative
                        icon
                        labelPosition="left"
                        onClick={() =>
                          this.deleteEvent(this.state.segmentIndex)
                        }
                        disabled={Object.keys(this.state.history).length === 0} //only have history with uploaded json and vid matching
                        style={{ marginTop: "5px" }}
                      >
                        <Icon name="remove circle" size="small" />
                        Delete Event
                      </Button>
                    </div>
                  </div>
                </div>
                {/* </Grid.Column>
                <Grid.Column> */}
                {/* </Grid.Column> */}
                {/* </div> */}
              </div>
              {/* </Grid> */}
            </Dimmer.Dimmable>
          </div>

          {/* </Dimmer.Dimmable> */}
          {/* </Grid.Column>
            <Grid.Column> */}
          {/* <List> */}

          {/* </List> */}

          {/* </Grid.Column>
          </Grid> */}
        </div>
      </div>
    );
  }
}

export default AnnotationApp;

import videojs from "video.js";

export const events = {
  Homerun: 2001,
  Balk: 2002,
  Wildpitch: 2003,
  Fourball: 2004,
  Strikeout: 2005,
  Bunt: 2006,
  Deadball: 2007,
  Sacrificebunt: 2008,
  Notout: 2009
};

export const eventsInv = {
  2001: "Homerun",
  2002: "Balk",
  2003: "Wildpitch",
  2004: "Fourball",
  2005: "Strikeout",
  2006: "Bunt",
  2007: "Deadball",
  2008: "Sacrificebunt",
  2009: "Notout"
};

export const scenes = {
  pitch: 0,
  pitchzoom: 1,
  closeup: 2,
  field: 3,
  adv: 4,
  subtitle: 5,
  stand: 6,
  dugout: 7,
  sketch: 8,
  stadium: 9,
  pip: 10
};

export const actions = {
  "Throwing a ball": 0,
  "Hitting a ball": 1,
  "Catching a ball": 2,
  "Missing a ball": 3,
  "Swing and a miss": 4
};

export function frameToSecs(frame, fps) {
  // var frame = parseInt(frame) + 1;
  // console.log(frame / 29.942323524343326);
  // console.log(29.942323524343326, (frame / 29.942323524343326));
  if (!fps) {
    return 0;
  }
  // console.log(fps, (parseInt(frame)+0.000002)/fps.toFixed(6));
  return (
    Math.ceil(((parseInt(frame) + 1) / fps.toFixed(6)) * 1000000) / 1000000
  );
  // 9.9666667 breaking point
  // (frame / fps).toFixed(7);
  // return parseInt(frame+1)/fps;
  // return (Math.floor(frame / fps) + parseInt(frame % fps) / fps).toPrecision(3);
}

export function secsToFrame(secs, fps) {
  return Math.floor(secs * fps);
}

export async function extractFramesFromVideo(playerID, fps) {
  return new Promise(async resolve => {
    // fully download it first (no buffering):
    // let videoBlob = await fetch(videoUrl).then(r => r.blob());
    // let videoObjectUrl = URL.createObjectURL(videoBlob);
    // let video = document.createElement("video");
    let video = videojs(playerID);
    let videoObjectUrl = video.currentSrc();

    let seekResolve;
    video.on("seeked", async function() {
      if (seekResolve) seekResolve();
    });

    video.src = videoObjectUrl;

    // workaround chromium metadata bug (https://stackoverflow.com/q/38062864/993683)
    while (
      (video.duration === Infinity || isNaN(video.duration)) &&
      video.readyState < 2
    ) {
      await new Promise(r => setTimeout(r, 1000));
      video.currentTime = 10000000 * Math.random();
    }
    let duration = video.duration;

    let canvas = document.createElement("canvas");
    let context = canvas.getContext("2d");
    let [w, h] = [video.videoWidth, video.videoHeight];
    canvas.width = w;
    canvas.height = h;

    let frames = [];
    let interval = 1 / fps;
    let currentTime = 0;

    while (currentTime < duration) {
      video.currentTime = currentTime;
      await new Promise(r => (seekResolve = r));

      context.drawImage(video, 0, 0, w, h);
      let base64ImageData = canvas.toDataURL();
      frames.push(base64ImageData);

      currentTime += interval;
    }
    resolve(frames);
  });
}

import videojs from "video.js";

export function frameToSecs(frame, fps) {
  if (!fps) {
    return new Error("fps not defined");
  }
  return (
    Math.ceil(((parseInt(frame) + 0.5) / fps.toFixed(6)) * 1000000) / 1000000
  );
}

export function secsToFrame(secs, fps) {
  return Math.floor(secs * fps);
}

// Potential more accurate functionality?
// export async function extractFramesFromVideo(playerID, fps) {
//   return new Promise(async resolve => {
//     // fully download it first (no buffering):
//     // let videoBlob = await fetch(videoUrl).then(r => r.blob());
//     // let videoObjectUrl = URL.createObjectURL(videoBlob);
//     // let video = document.createElement("video");
//     let video = videojs(playerID);
//     let videoObjectUrl = video.currentSrc();

//     let seekResolve;
//     video.on("seeked", async function() {
//       if (seekResolve) seekResolve();
//     });

//     video.src = videoObjectUrl;

//     // workaround chromium metadata bug (https://stackoverflow.com/q/38062864/993683)
//     while (
//       (video.duration === Infinity || isNaN(video.duration)) &&
//       video.readyState < 2
//     ) {
//       await new Promise(r => setTimeout(r, 1000));
//       video.currentTime = 10000000 * Math.random();
//     }
//     let duration = video.duration;

//     let canvas = document.createElement("canvas");
//     let context = canvas.getContext("2d");
//     let [w, h] = [video.videoWidth, video.videoHeight];
//     canvas.width = w;
//     canvas.height = h;

//     let frames = [];
//     let interval = 1 / fps;
//     let currentTime = 0;

//     while (currentTime < duration) {
//       video.currentTime = currentTime;
//       await new Promise(r => (seekResolve = r));

//       context.drawImage(video, 0, 0, w, h);
//       let base64ImageData = canvas.toDataURL();
//       frames.push(base64ImageData);

//       currentTime += interval;
//     }
//     resolve(frames);
//   });
// }

export const playbackRates = [1, 1.5, 3, 5];

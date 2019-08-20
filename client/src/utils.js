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

export const playbackRates = [1, 1.5, 3, 5];

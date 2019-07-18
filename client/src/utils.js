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
  return Math.floor(frame / fps) + parseInt(frame % fps) / fps;
}

export function secsToFrame(secs, fps) {
  return Math.floor(secs * fps);
}

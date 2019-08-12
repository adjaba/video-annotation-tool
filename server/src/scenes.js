const db = require("./db").getDb();
const path = require("path");

const Scenes = {
  getAll: () => {
    const scenes = db
      .prepare(
        `
    select *
    from scenes
    `
      )
      .all();
    return scenes;
  },
  get: () => {
    const scenes = db
      .prepare(
        `
    select scenes.sceneName, id
    from scenes
    where scenes.deleted = false
    `
      )
      .all();
    return scenes;
  },
  add: name => {
    db.prepare(
      `
  insert into scenes(sceneName, deleted)
  values (?, ?);
  `
    ).run(name, 0);
  },
  rename: (name, id) => {
    db.prepare(
      `
    update scenes
      set sceneName = ?
    where scenes.id = ?;
    `
    ).run(name, id);
  },
  toggleDelete: id => {
    db.prepare(
      `
      update scenes
        set deleted = NOT deleted
      where scenes.id = ?;
      `
    ).run(id);
  }
};

module.exports = Scenes;

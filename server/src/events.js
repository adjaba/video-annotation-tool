const db = require("./db").getDb();
const path = require("path");

const Events = {
  getAll: () => {
    const events = db
      .prepare(
        `
  select *
  from events
  `
      )
      .all();
    return events;
  },
  get: () => {
    const events = db
      .prepare(
        `
  select events.eventName, id
  from events
  where events.deleted = false
  `
      )
      .all();
    return events;
  },
  add: (name, id) => {
    const events = db
      .prepare(
        `
  insert into events(eventName, id, deleted)
  values (?, ?, ?);
  from events
  `
      )
      .run(name, id, 0);
  },
  rename: (name, id) => {
    db.prepare(
      `
  update events
    set eventName = ?,
  where events.id = ?;
  `
    ).run(name, id);
  },
  toggleDelete: id => {
    db.prepare(
      `
    update events
      set deleted = NOT deleted
    where events.id = ?;
    `
    ).run(id);
  }
};

module.exports = Events;

const db = require("./db").getDb();
const path = require("path");

const Videos = {
  getByVideoName: videoName => {
    console.log("getByVideoName");
    const videos = db
      .prepare(
        `
select id
from videos
where videos.videoName = ?;
`
      )
      .all(videoName);
    return videos;
  },

  get: id => {
    const video = db
      .prepare(
        `
select *
from videos
where videos.id = ?;
`
      )
      .get(id);

    return { ...video, currentJson: JSON.parse(video.currentJson) };
  },
  getAll: () => {
    const videos = db
      .prepare(
        `
select *
from videos
`
      )
      .all();

    return videos.map(video => ({
      ...video,
      currentJson: JSON.parse(video.currentJson)
    }));
  },
  addSession: (id, videoName, jsonName, currentJson) => {
    console.log("video", JSON.stringify(currentJson));
    const lastInsertRowId = db
      .prepare(
        `
  insert into videos(videoName, currentJson, lastEdited)
  values (?, ?, ?);
  `
      )
      .run(videoName, JSON.stringify(currentJson), +new Date());

    // const { lastInsertRowid } = stmt.run(videoName, currentJson);
    return lastInsertRowId;
  },
  updateSession: (id, videoName, jsonName, currentJson) => {
    console.log("video", JSON.stringify(currentJson));
    const lastInsertRowId = db
      .prepare(
        `
  update videos
    set videoName = ?,
    currentJson = ?,
    lastEdited = ?
  where videos.id = ?;
  `
      )
      .run(videoName, JSON.stringify(currentJson), +new Date(), id);

    // const { lastInsertRowid } = stmt.run(videoName, currentJson);
    return lastInsertRowId;
  },
  //   addVideoUrls: (projectId, urls) => {
  //     const getName = url =>
  //       path.basename(new URL(url, 'https://base.com').pathname);

  //     const stmt = db.prepare(`
  // insert into videos(originalName, link, externalLink, labeled, labelData, projectsId)
  // values (?, 'stub', ?, 0, '{ }', ?);
  // `);

  //     for (const url of urls) {
  //       const name = getName(url);
  //       const { lastInsertRowid } = stmt.run(name, url, projectId);
  //       videos.updateLink(lastInsertRowid, { projectId, filename: name });
  //     }
  //   },

  //   addVideoStub: (projectId, filename, localPath) => {
  //     const stmt = db.prepare(`
  // insert into videos(originalName, localPath, link, labeled, labelData, projectsId)
  // values (?, ?, 'stub', 0, '{ }', ?);
  // `);

  //     const { lastInsertRowid } = stmt.run(filename, localPath, projectId);
  //     return lastInsertRowid;
  //   },

  //   updateLink: (videoId, { projectId, filename }) => {
  //     const ext = path.extname(filename);
  //     const link = `/uploads/${projectId}/${videoId}${ext}`;
  //     db.prepare(
  //       `
  // update videos
  //    set link = ?
  //  where id = ?;
  // `
  //     ).run(link, videoId);
  //     return `${videoId}${ext}`;
  //   },

  //   allocateUnlabeledVideo: (projectId, videoId) => {
  //     // after this period of time we consider the video to be up for labeling again
  //     const lastEditedTimeout = 5 * 60 * 1000;

  //     let result = null;
  //     db.transaction(() => {
  //       if (!videoId) {
  //         const unmarkedVideo = db
  //           .prepare(
  //             `
  // select id
  // from videos
  // where projectsId = ? and labeled = 0 and lastEdited < ?;
  // `
  //           )
  //           .get(projectId, new Date() - lastEditedTimeout);

  //         videoId = unmarkedVideo && unmarkedVideo.id;
  //       }

  //       if (!videoId) {
  //         result = null;
  //       } else {
  //         db.prepare(`update videos set lastEdited = ? where id = ?;`).run(
  //           +new Date(),
  //           videoId
  //         );
  //         result = { videoId };
  //       }
  //     })();

  //     return result;
  //   },

  updateLabel: (videoId, currentJson) => {
    db.prepare(
      `
update videos
set currentJson = ?, lastEdited = ?
where id = ?;
`
    ).run(JSON.stringify(currentJson), +new Date(), videoId);
  },

  updateLabeled: (videoId, labeled) => {
    db.prepare(
      `
update videos
set labeled = ?
where id = ?;
`
    ).run(labeled ? 1 : 0, videoId);
  },

  delete: videoId => {
    db.prepare(
      `
delete from videos
where id = ?;
`
    ).run(videoId);
  },

  getForImport: (projectId, originalName) => {
    const video = db
      .prepare(
        `
select *
from videos
where projectsId = ? and originalName = ?;
`
      )
      .get(projectId, originalName);

    if (!video) {
      throw new Error("No video with name " + originalName);
    }

    return { ...video, labelData: JSON.parse(video.labelData) };
  }
};

module.exports = Videos;

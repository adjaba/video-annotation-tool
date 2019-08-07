// const express = require('express');
// const bodyParser = require('body-parser');

// const app = express();
// const port = process.env.PORT || 5000;

const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const request = require("request");

const path = require("path");
const fs = require("fs").promises;

const videos = require("./videos");
// const projects = require('./queries/projects');
// const images = require('./queries/images');
// const mlmodels = require('./queries/mlmodels');
// const exporter = require('./exporter');
// const importer = require('./importer');
// const { setup, checkLoginMiddleware, authHandler } = require('./auth');

const UPLOADS_PATH =
  process.env.UPLOADS_PATH || path.join(__dirname, "..", "uploads");

const app = express();

// setup(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const uploads = multer({
  storage: multer.diskStorage({
    destination: async (req, file, cb) => {
      const { projectId } = req.params;
      try {
        if (!projects.get(projectId)) {
          throw new Error("No such projectId.");
        }
        const dest = path.join(UPLOADS_PATH, projectId);
        try {
          await fs.mkdir(dest);
        } catch (err) {}
        cb(null, dest);
      } catch (err) {
        cb(err);
      }
    },
    filename: (req, file, cb) => {
      try {
        const { projectId } = req.params;
        const filename = file.originalname;

        if (req.reference) {
          const ext = path.extname(filename);
          const name = `_reference${ext}`;
          const referenceLink = `/uploads/${projectId}/${name}`;
          projects.updateReference(projectId, referenceLink);
          cb(null, name);
        } else {
          const id = images.addImageStub(projectId, filename, null);
          const newName = images.updateLink(id, { projectId, filename });
          cb(null, newName);
        }
      } catch (err) {
        cb(err);
      }
    }
  })
});

// app.post('/api/uploads/:projectId', uploads.array('videos'), (req, res) => {
//     res.json({ success: true });
// })
app.post("/api/end", (req, res) => {
  const { videoName, jsonName, currentJson } = req.body;

  if (videos.getByVideoName(videoName)) {
    console.log("already added");
  } else {
    const id = videos.addSession(videoName, jsonName, currentJson);
    console.log("added entry with id", id);
  }
});

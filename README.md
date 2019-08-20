# Video Annotation

A web application for video annotation.

## Features

- Allows users to annotate video by segmenting into different events, and labeling each event with the event type, scenes, and actions
- Frontend-only frame seeking as accurate as HTML5 video browser frame seeking
- Admin portal to edit scenes and actions for users
- Restores browser state on upload of previously-edited video
- Export functionality to get edited metadata

## Development

### Installation

Install node.js (>=10.x) and yarn. Then install the node modules:

```bash
cd server
yarn install
cd ../client
yarn install
cd ..
yarn install
```

### Launching the app

Then, run the development mode.

```bash
yarn start
```

## Build For Production

Install node.js (>=10.x) and yarn. Then install the node modules:

```bash
cd server
yarn install
cd ../client
yarn install
cd ..
yarn install
```

Build the client app:

```bash
cd client && yarn run build ** cd ..
```

Run the server app in production mode serving the client build:

```bash
env PORT=3000 NODE_ENV=production node server/src/index.js
```

## Features

Note that the gifs below have been made before the addition of frame increment buttons.

### Annotation

On video upload:

- If previously edited before, there is an option to restore the browser state from the last time the video was edited.
  ![](/gifs/VArestore.gif)

- You can upload a JSON with at least the following structure: (Note that duration is in seconds)

```json
{
  "database": {
    "VIDEO_NAME": {
      "duration": 123,
      "fps": 123,
      "annotations": []
    }
  }
}
```

![](/gifs/VAupload.gif)

- If you want to annotate from scratch, you can also do so. Note that you might have to wait some time for the blank state to initialize (on testing, typically around 1-2 secs)
  ![](/gifs/VAnew.gif)

Note that since there is no user ID, there is no measure against someone editing the same video and overwriting someone else's last edits. To ensure that you are resuming your previous edits, please upload the matching json.

## Project Support and Development

This project has been developed as part of my internship at the [NCSOFT](http://global.ncsoft.com/global/) Vision AI Lab in the summer of 2019.

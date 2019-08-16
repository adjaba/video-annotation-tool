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

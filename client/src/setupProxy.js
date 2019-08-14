const proxy = require("http-proxy-middleware");

const mainPort = process.env.PORT || "3000";
const port = 3001;
module.exports = function(app) {
  app.use(proxy("/api", { target: `http://0.0.0.0:${port}` }));
};

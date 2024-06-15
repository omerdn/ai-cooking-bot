const path = require("path");

module.exports = {
  mode: "production",
  entry: "./src/app.js",
  output: {
    filename: "script.js",
    path: path.resolve(__dirname, "assets"),
  }
};

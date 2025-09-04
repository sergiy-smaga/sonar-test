/* eslint-disable no-undef */
const fs = require("fs");
const path = require("path");
const { performance } = require("perf_hooks");

const date = new Date();

const fileName = `${date.getFullYear()}-${
  date.getMonth() + 1
}-${date.getDate()}-log`;

const pathLogDir = path.join(process.env.HOME, "EventsExpressNode-logs");
const pathLogFile = path.join(pathLogDir, fileName);

const isAccessible = (path) => {
  return fs.accessSync(path);
};

const logger = () => {
  try {
    isAccessible(pathLogDir);
  } catch (error) {
    console.warn(`Log directory doesn't exist, creating: ${pathLogDir}`);
    try {
      fs.mkdirSync(pathLogDir, { recursive: true });
    } catch (mkdirError) {
      console.error(`Failed to create log directory: ${mkdirError.message}`);
      throw mkdirError; // Re-throw if we can't create the directory
    }
  }

  try {
    isAccessible(pathLogFile);
  } catch (error) {
    console.warn(`Log file doesn't exist, creating: ${pathLogFile}`);
    try {
      fs.writeFileSync(pathLogFile, "");
    } catch (writeError) {
      console.error(`Failed to create log file: ${writeError.message}`);
      throw writeError; // Re-throw if we can't create the file
    }
  }

  return (req, _, next) => {
    try {
      const start = performance.now();
      next();

      const perf = performance.now() - start;
      const newLog = `\n${req.method} ${req.originalUrl} ${perf}`;
      fs.appendFileSync(pathLogFile, newLog);
    } catch (error) {
      console.log(error);
    }
  };
};

module.exports = logger;

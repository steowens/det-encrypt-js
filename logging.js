const { createLogger, format, transports } = require("winston");
 
const logger = createLogger({
  format: format.combine(format.timestamp(), format.json()),
  transports: [new transports.Console({})],
});

function log(level, message){
  logger.log(level, message)
}

module.exports = {
    debug: (message) => log("debug", message),
    info: (message) => log("info", message),
    warn: (message) => log("warn", message),
    error: (message) => log("error", message)
}
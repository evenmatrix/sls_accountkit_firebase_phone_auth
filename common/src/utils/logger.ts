import winston = require("winston");
import * as R from "ramda";

// const bugsnag = require("bugsnag");

export type LoggingConfig = {
  logging: {
    level?: string;
  }

  // bugsnag: {
  //   key: string;
  //   enabled: boolean;
  //   stage?: string;
  //   service?: string;
  // }
};

export function logger(config: LoggingConfig) {

  const instance = new winston.Logger();

  instance.level = config.logging.level || "info";

  instance.add(winston.transports.Console, {
    colorize: true,
    timestamp: true,
    prettyPrint: true,
    handleExceptions: false,
  });

  // bugsnag.register(config.bugsnag.key, {
  //   releaseStage: config.bugsnag.stage || "development",
  //   metaData: {
  //     service: config.bugsnag.service || "service-unspecified"
  //   },
  // });

  process.on("unhandledRejection", (error, promise) => {
    fatal(error);
  });

  process.on("uncaughtException", error => {
    fatal(error);
  });

  const fatal = (e) => {
    error(e, null, e => {
      process.exit(-1);
    });
  };

  const error = (err, message?: string, cb?: (err) => void) => {
    const args = R.isNil(message) ? [err] : [err, message];
    // if (config.bugsnag.enabled) {
    //   bugsnag.notify(err, (e, r) => {
    //     instance.error.apply(instance, args);
    //     if (cb) cb(err);
    //   });
    // } else {
      instance.error.apply(instance, args);
      if (cb) cb(err);
    // }
  };

  const warn = (...params) => {
    instance.warn.apply(instance, params);
  };

  const info = (...params) => {
    instance.info.apply(instance, params);
  };

  const debug = (...params) => {
    instance.debug.apply(instance, params);
  };

  return {
    fatal,
    error,
    warn,
    info,
    debug,
    // bugsnag,
  };
}

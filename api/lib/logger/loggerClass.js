const logger = require("./logger")
let instance = null;

class LoggerClass {
    constructor() {
        if (!instance) {
            instance = this;
        }
        return instance;
    }

    #createLogObject(level, email, location, proc_type, logData) {
        return {
            level, email, location, proc_type, log: logData
        };
    }

    info(level, email, location, proc_type, logData) {
        const logObj = this.#createLogObject(level, email, location, proc_type, logData);
        logger.info(logObj);
    }

    warn(level, email, location, proc_type, logData) {
        const logObj = this.#createLogObject(level, email, location, proc_type, logData);
        logger.warn(logObj);
    }

    error(level, email, location, proc_type, logData) {
        const logObj = this.#createLogObject(level, email, location, proc_type, logData);
        logger.error(logObj);
    }

    verbose(level, email, location, proc_type, logData) {
        const logObj = this.#createLogObject(level, email, location, proc_type, logData);
        logger.verbose(logObj);
    }

    silly(level, email, location, proc_type, logData) {
        const logObj = this.#createLogObject(level, email, location, proc_type, logData);
        logger.silly(logObj);
    }

    http(level, email, location, proc_type, logData) {
        const logObj = this.#createLogObject(level, email, location, proc_type, logData);
        logger.http(logObj);
    }
}

module.exports = new LoggerClass();

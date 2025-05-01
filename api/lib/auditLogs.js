const Enum = require("../config/enum");
const AuditLogs = require("../db/models/AuditLogs");

let instance = null;

class AuditLogger {
    constructor() {
        if (!instance) {
            instance = this;
        }
        return instance;
    }

    info(email, location, proc_type, log) {
        this.#saveToDb({
            level: Enum.LOG_LEVELS.INFO,
            email,
            location,
            proc_type,
            log
        });
    }

    warn(email, location, proc_type, log) {
        this.#saveToDb({
            level: Enum.LOG_LEVELS.WARN,
            email,
            location,
            proc_type,
            log
        });
    }

    error(email, location, proc_type, log) {
        this.#saveToDb({
            level: Enum.LOG_LEVELS.ERROR,
            email,
            location,
            proc_type,
            log
        });
    }

    debug(email, location, proc_type, log) {
        this.#saveToDb({
            level: Enum.LOG_LEVELS.DEBUG,
            email,
            location,
            proc_type,
            log
        });
    }

    verbose(email, location, proc_type, log) {
        this.#saveToDb({
            level: Enum.LOG_LEVELS.VERBOSE,
            email,
            location,
            proc_type,
            log
        });
    }

    http(email, location, proc_type, log) {
        this.#saveToDb({
            level: Enum.LOG_LEVELS.HTTP,
            email,
            location,
            proc_type,
            log
        });
    }

    #saveToDb(data) {
        // Eğer Mongoose dökümanıysa sadeleştir
        if (typeof data.log === "object" && typeof data.log.toObject === "function") {
            data.log = data.log.toObject(); // sade nesneye çevir
        }
    
        AuditLogs.create(data).catch(err => {
            console.error("Audit log save error:", err);
        });
    }
    

}

module.exports = new AuditLogger();

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = mongoose.Schema({
    location: String,
    proc_type: String,
    level: String,
    log: Schema.Types.Mixed, // <--- Buraya dikkat!
}, {
    versionKey: false,
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
})

class AuditLogs extends mongoose.Model {

}

schema.loadClass(AuditLogs);
module.exports = mongoose.model("audit_logs", schema);
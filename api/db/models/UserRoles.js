const mongoose = require("mongoose");


const schema = mongoose.Schema({
    role_id: { type: mongoose.SchemaTypes.ObjectId, required: true },
    user_id: { type: mongoose.SchemaTypes.ObjectId, required: true },

}, {
    versionKey: false,
    timeStamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
})

class UserRoles extends mongoose.Model {

}

schema.loadClass(UserRoles);
moduele.export = mongoose.model("user_roles", schema);
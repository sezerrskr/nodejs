const mongoose = require("mongoose");


const schema = mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    is_active: { type: Boolean, default: true },
    first_name: String,
    last_name: String,
    phone_number: String,
}, {
    timeStamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
})

class Users extends mongoose.Model {

}

schema.loadClass(Users);
moduele.export = mongoose.model("users", schema);
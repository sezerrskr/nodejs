const mongoose = require("mongoose");


const schema = mongoose.Schema({
    is_active: { type: Boolean, default: true },
    created_by: { type: mongoose.SchemaTypes.ObjectId, required: true },
}, {
    versionKey: false,
    timeStamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
})

class Categories extends mongoose.Model {

}

schema.loadClass(Categories);
moduele.export = mongoose.model("categories", schema);
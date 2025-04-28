var express = require('express');
var router = express.Router();
const Roles = require('../db/models/Roles');
const Response = require('../lib/response');
const CustomError = require("../lib/error")
const Enum = require("../config/enum")
// Roles List
router.get("/", async (req, res, next) => {
    try {
        let roles = await Roles.find({});

        res.json(Response.successResponse(roles))
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(Response.errorResponse(err))
    }
})

// Add role
router.post("/add", async (req, res, next) => {

    let body = req.body;

    try {
        if (!body.role_name) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "role_name field must be filled");

        let roles = new Roles({
            role_name: body.role_name,
            is_active: true,
            created_by: req.user?.id,
        });

        await roles.save();
        res.json(Response.successResponse(roles))
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(Response.errorResponse(err))
    }
})

// Update role
router.post("/update", async (req, res, next) => {

    let body = req.body;

    try {
        if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "_id fields must be filled");

        let updates = {}

        if (body.role_name) updates.role_name = body.role_name;
        if (typeof body.is_active === "boolean") updates.is_active = body.is_active;

        await Roles.updateOne({ _id: body._id }, updates)
        res.json(Response.successResponse({ succes: true }))
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(Response.errorResponse(err))
    }
})

// Delete role
router.post("/delete", async (req, res, next) => {

    let body = req.body;

    try {
        if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "_id fields must be filled");

        await Roles.deleteOne({ _id: body._id })

        res.json(Response.successResponse({ succses: true }))
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(Response.errorResponse(err))
    }
})



module.exports = router
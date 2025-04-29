var express = require('express');
var router = express.Router();
const Roles = require('../db/models/Roles');
const Response = require('../lib/response');
const CustomError = require("../lib/error")
const Enum = require("../config/enum")
const role_privileges = require("../config/role_privileges");
const RolePrivileges = require('../db/models/RolePrivileges');

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
        if (!body.permissions || !Array.isArray(body.permissions) || body.permissions === 0) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "permissions field must be an array ");
        }

        let roles = new Roles({
            role_name: body.role_name,
            is_active: true,
            created_by: req.user?.id,
        });

        await roles.save();

        for (let i = 0; i < body.permissions.length; i++) {
            let priv = new RolePrivileges({
                role_id: roles._id,
                permission: body.permissions[i],
                created_by: req.user?.id
            });

            await priv.save();
        }

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
        if (Array.isArray(body.permissions) && body.permissions.length > 0) {
            let permissions = await RolePrivileges.find({ role_id: body._id });

            let removedPermissions = permissions.filter(x => !body.permissions.includes(x.permission));
            let newPermissions = body.permissions.filter(x => !permissions.map(p => p.permission).includes(x));

            if (removedPermissions.length > 0) {
                await RolePrivileges.deleteMany({ _id: { $in: removedPermissions.map(x => x._id) } });
            }

            if (newPermissions.length > 0) {
                for (let i = 0; i < newPermissions.length; i++) {
                    let priv = new RolePrivileges({
                        role_id: body._id,
                        permission: newPermissions[i],
                        created_by: req.user?.id
                    });

                    await priv.save();
                }
            }
        }

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


router.get("/role_privileges", async (res, req, next) => {
    req.json(role_privileges);
})


module.exports = router
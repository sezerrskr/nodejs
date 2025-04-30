var express = require('express');
var router = express.Router();
const Roles = require('../db/models/Roles');
const Response = require('../lib/response');
const CustomError = require("../lib/error");
const Enum = require("../config/enum");
const role_privileges = require("../config/role_privileges");
const RolePrivileges = require('../db/models/RolePrivileges');
const UserRoles = require('../db/models/UserRoles');
const Users = require('../db/models/Users');
const bcrypt = require('bcrypt');

// Roles List
router.get("/", async (req, res, next) => {
    try {
        let roles = await Roles.find({});
        res.json(Response.successResponse(roles));
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});

// Add role
router.post("/add", async (req, res, next) => {
    let body = req.body;

    try {
        if (!body.role_name) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "role_name field must be filled");
        if (!body.permissions || !Array.isArray(body.permissions) || body.permissions.length === 0) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "permissions field must be an array and cannot be empty");
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

        res.json(Response.successResponse(roles));
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});

// Update role
router.post("/update", async (req, res) => {
    try {
        let body = req.body;
        console.log(body);
        let updates = {};

        // _id kontrolü
        if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "validation error!", "_id alanı dolu olmalı!");

        // Şifre kontrolü
        if (body.password && body.password.length >= Enum.PASSWORD_LENGTH) {
            updates.password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8));
            console.log("Şifre değişti");
        }

        // Diğer alanların kontrolü
        if (typeof body.is_active === "boolean") updates.is_active = body.is_active;
        if (body.first_name) updates.first_name = body.first_name;
        if (body.last_name) updates.last_name = body.last_name;
        if (body.phone_number) updates.phone_number = body.phone_number;

        // Roller kontrolü
        if (Array.isArray(body.roles) && body.roles.length > 0) {
            // Kullanıcının mevcut rollerini al
            let userRoles = await UserRoles.find({ user_id: body._id });

            // Kaldırılacak roller
            let removedRoles = userRoles.filter(x => !body.roles.includes(String(x.role_id)));
            // Yeni roller
            let newRoles = body.roles.filter(x => !userRoles.map(r => String(r.role_id)).includes(x));

            // Kaldırılacak roller varsa, sil
            if (removedRoles.length > 0) {
                await UserRoles.deleteMany({ _id: { $in: removedRoles.map(x => x._id) } });
            }

            // Yeni roller varsa, ekle
            if (newRoles.length > 0) {
                for (let i = 0; i < newRoles.length; i++) {
                    let userRole = new UserRoles({
                        role_id: newRoles[i],
                        user_id: body._id,
                    });
                    await userRole.save();
                }
            }
        } else {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Rol alanı geçerli bir dizi olmalı!");
        }

        // Roller geçerliliğini kontrol et
        let dataRoles = await Roles.find({ _id: { $in: body.roles } });
        if (dataRoles.length === 0) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Geçerli roller bulunamadı!");
        }

        // Kullanıcıyı güncelle
        await Users.updateOne({ _id: body._id }, updates);

        res.json(Response.successResponse({ success: true }));

    } catch (err) {
        const errorRes = Response.errorResponse(err);
        res.status(errorRes.code).json(errorRes);
    }
});

// Delete role
router.post("/delete", async (req, res, next) => {
    let body = req.body;

    try {
        if (!body._id) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "_id alanı dolu olmalı!");
        }

        // Silmek istediğiniz rol ile ilgili işlem
        await Roles.deleteOne({ _id: body._id });

        res.json(Response.successResponse({ success: true }));
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});

// Role privileges
router.get("/role_privileges", async (req, res, next) => {
    res.json(role_privileges);
});

module.exports = router;
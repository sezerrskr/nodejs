const express = require('express');
const router = express.Router();
const Users = require('../db/models/Users');
const Response = require('../lib/response');
const CustomError = require("../lib/error");
const Enum = require("../config/enum");
const bcrypt = require('bcrypt');
const validator = require("validator"); // <-- Yeni paket
const Roles = require('../db/models/Roles');
const UserRoles = require('../db/models/UserRoles');

// GET /users
router.get('/', async (req, res) => {
    try {
        const users = await Users.find({});
        res.json(Response.successResponse(users));
    } catch (err) {
        res.json(Response.errorResponse(err));
    }
});

// POST /users/add
router.post('/add', async (req, res) => {
    const { email, password, is_active, first_name, last_name, phone_number, roles } = req.body;

    try {
        // Email kontrolü
        if (!email) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Email alanı dolu olmalı!");
        if (!validator.isEmail(email)) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Email doğru bir formatta olmalı!");

        // Şifre kontrolü
        if (!password) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Şifre alanı dolu olmalı!");
        if (password.length < Enum.PASSWORD_LENGTH) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", `Şifre uzunluğu en az ${Enum.PASSWORD_LENGTH} olmalı!`);
        }

        // Kullanıcı var mı kontrolü
        const existingUserMail = await Users.findOne({ email });
        if (existingUserMail) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "User Exists", "Bu email'e sahip bir kullanıcı zaten var!");
        }

        const existingUserPhone = await Users.findOne({ phone_number });
        if (existingUserPhone) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "User Exists", "Bu telefon numarasına sahip bir kullanıcı zaten var!");
        }

        if (!roles || !Array.isArray(roles) || roles.length == 0) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Rol alanı bir dizi olmalı");
        }

        let dataRoles = await Roles.find({ _id: { $in: roles } });
        if (dataRoles.length === 0) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Geçerli rol bulunamadı!");
        }

        // Şifreyi hashle
        const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(8));

        // Yeni kullanıcı oluştur
        let user = await Users.create({
            email,
            password: hashedPassword,
            is_active,
            first_name,
            last_name,
            phone_number
        });

        for (let i = 0; i < dataRoles.length; i++) {
            await UserRoles.create({
                role_id: roles[i],
                user_id: user._id
            })
        }

        res.status(Enum.HTTP_CODES.CREATED).json(Response.successResponse({ success: true }, Enum.HTTP_CODES.CREATED));
    } catch (err) {
        const errorRes = Response.errorResponse(err);
        res.status(errorRes.code).json(errorRes);
    }
});

router.post("/update", async (req, res) => {
    try {
        let body = req.body;

        let updates = {};

        if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "validation error!", "_id alanı dolu olmalı!")

        if (body.password && body.password.length >= Enum.PASSWORD_LENGTH) {
            updates.password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8));
        }



        if (typeof body.is_active === "boolean") updates.is_active = body.is_active;
        if (body.first_name) updates.first_name = body.first_name;
        if (body.last_name) updates.last_name = body.last_name;
        if (body.phone_number) updates.phone_number = body.phone_number;

        if (Array.isArray(body.roles) && body.roles.length > 0) {
            let dataRoles = await Roles.find({ _id: { $in: body.roles } });
        
            if (dataRoles.length === 0) {
                throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Geçerli roller bulunamadı!");
            }
        
            let userRoles = await UserRoles.find({ user_id: body._id });
        
            let removedRoles = userRoles.filter(x => !body.roles.includes(String(x.role_id)));
            let newRoles = body.roles.filter(x => !userRoles.map(r => String(r.role_id)).includes(x));
        
            if (removedRoles.length > 0) {
                await UserRoles.deleteMany({ _id: { $in: removedRoles.map(x => x._id) } });
            }
        
            if (newRoles.length > 0) {
                for (let i = 0; i < newRoles.length; i++) {
                    let userRole = new UserRoles({
                        role_id: newRoles[i],
                        user_id: body._id,
                    });
        
                    await userRole.save();
                }
            }
        }        

        let dataRoles = await Roles.find({ _id: { $in: body.roles } });
        if (dataRoles.length === 0) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Geçerli roller bulunamadı!");
        }        

        await Users.updateOne({ _id: body._id }, updates);

        res.json(Response.successResponse({ success: true }))
    } catch (err) {
        const errorRes = Response.errorResponse(err);
        res.status(errorRes.code).json(errorRes);
    }
})

router.post("/delete", async (req, res) => {
    try {
        const body = req.body;

        if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "_id alanı dolu olmalı!");

        await Users.deleteOne({ _id: body._id });
        await UserRoles.deleteMany({ user_id: body._id })

        res.json(Response.successResponse({ success: true }));

    } catch (err) {
        const errorRes = Response.errorResponse(err);
        res.status(errorRes.code).json(errorRes);
    }
})

router.post('/register', async (req, res) => {
    const { email, password, is_active, first_name, last_name, phone_number } = req.body;

    try {

        let user = await Users.findOne({});

        if (user) {
            return res.sendStatus(Enum.HTTP_CODES.NOT_FOUND)
        }

        // Email kontrolü
        if (!email) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Email alanı dolu olmalı!");
        if (!validator.isEmail(email)) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Email doğru bir formatta olmalı!");

        // Şifre kontrolü
        if (!password) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Şifre alanı dolu olmalı!");
        if (password.length < Enum.PASSWORD_LENGTH) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", `Şifre uzunluğu en az ${Enum.PASSWORD_LENGTH} olmalı!`);
        }

        // Kullanıcı var mı kontrolü
        const existingUserMail = await Users.findOne({ email });
        if (existingUserMail) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "User Exists", "Bu email'e sahip bir kullanıcı zaten var!");
        }

        const existingUserPhone = await Users.findOne({ phone_number });
        if (existingUserPhone) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "User Exists", "Bu telefon numarasına sahip bir kullanıcı zaten var!");
        }

        // Şifreyi hashle
        const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(8));

        // Yeni kullanıcı oluştur
        let created_user = await Users.create({
            email,
            password: hashedPassword,
            is_active,
            first_name,
            last_name,
            phone_number
        });

        let role = await Roles.create({
            "role_name": Enum.SUPER_ADMIN,
            "is_active": true,
            "created_by": created_user._id
        })

        await UserRoles.create({
            "role_id": role._id,
            "user_id": created_user._id
        })

        res.status(Enum.HTTP_CODES.CREATED).json(Response.successResponse({ success: true }, Enum.HTTP_CODES.CREATED));
    } catch (err) {
        const errorRes = Response.errorResponse(err);
        res.status(errorRes.code).json(errorRes);
    }
});

module.exports = router;

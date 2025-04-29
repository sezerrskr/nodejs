var express = require('express');
var router = express.Router();
const Users = require('../db/models/Users');
const Response = require('../lib/response');
const CustomError = require("../lib/error");
const Enum = require("../config/enum")
const bcrypt = require('bcrypt');
const is = require("is_js")

/* GET users listing. */
router.get('/', async (req, res, next) => {
    try {
        let users = await Users.find({});
        res.json(Response.successResponse(users))
    } catch (err) {
        res.json(Response.errorResponse(err))
    }

});

router.post('/add', async (req, res, next) => {
    let body = req.body;

    try {
        if (!body.email) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "email field must be filled");
        if (is.not.email(body.email)) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "email field must be an email format");
        if (!body.password) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "password field must be filled");
        if (body.password.length < Enum.PASSWORD_LENGTH) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "password length must be greater than " + Enum.PASSWORD_LENGTH);
        }

        const existingUser = await Users.findOne({ email: body.email, phone_number: body.phone_number });
        if (existingUser) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "User Exists", "A user with this email already exists");
        }

        let password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8), null);

        await Users.create({
            email: body.email,
            password: password,
            is_active: body.is_active,
            first_name: body.first_name,
            last_name: body.last_name,
            phone_number: body.phone_number
        });

        res.status(Enum.HTTP_CODES.CREATED).json(Response.successResponse({ success: true }, Enum.HTTP_CODES.CREATED));
    } catch (err) {
        const errorRes = Response.errorResponse(err);
        res.status(errorRes.code).json(errorRes);
    }
});


module.exports = router;

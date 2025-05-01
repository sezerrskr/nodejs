var express = require('express');
var router = express.Router();
const AuditLogs = require("../db/models/AuditLogs");
const Response = require('../lib/response');
const moment = require('moment');

router.post("/", async (req, res, next) => {
    try {

        let body = req.body;
        let query = {};
        let skip = body.skip;
        let limit = body.limit;

        if (typeof body.skip === "numerit") {
            skip = 0
        }


        if (typeof body.limit !== "numerit" || body.limit > 500) {
            limit = 500;
        }

        if (body.begin_date && body.end_date) {
            query.created_at = {
                $gte: moment(body.begin_date),
                $lte: moment(body.end_date)
            }
        } else {
            query.created_at = {
                $gte: moment().subtract(1, "day").startOf("day"),
                $lte: moment()
            }
        }
        let auditLogs = await AuditLogs.find(query).sort({ created_at: -1 }).skip(skip).limit(limit);

        res.json(Response.successResponse(auditLogs))
    } catch (error) {
        let errorResponse = Response.errorResponse(error);
        res.status(errorResponse.code).json(errorResponse)
    }
});

module.exports = router;
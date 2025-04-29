const CustomError = require("./error");
const Enum = require("../config/enum");

class Response {
    constructor() { }

    static successResponse(data, code = 200) {
        return {
            data,
            code
        }
    }

    static errorResponse(error) {
        console.error(error)

        if (error instanceof CustomError) {
            return {
                code: error.code,
                error: {
                    message: error.message,
                    description: error.description
                }
            }
        } else if (error.message.includes("E11000")) {
            return {
                code: Enum.HTTP_CODES.CONFLICT,
                error: {
                    message: "Already exists!",
                    description: "Already exists!"
                }
            }
        }

        return {
            code: Enum.HTTP_CODES.INT_SERVER_ERROR,
            error: {
                message: "Unknow error",
                description: error.message
            }
        }
    }

}

module.exports = Response;
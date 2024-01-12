import { encryptAES } from "../config/cryptoEncryption.js"

export default (req, res, statusCode, responseToSend, encrypt = false) => {
    try {
        if(encrypt && global.requestEncryptFlag  && req.x_auth) {
            if(typeof responseToSend == 'object') {
                responseToSend = JSON.stringify(responseToSend);
            }
            responseToSend = encryptAES(responseToSend, req.x_auth?.secretKey, req.x_auth?.iv);
        }
        res.status(statusCode).send(responseToSend)

    } catch(e) {
        global.log.error(`Error occurs while sending response custome Response - ${JSON.stringify({e: e.stack})}`);
        res.status(500).send({status: 'error', message: "Internal server error"});
    }
}
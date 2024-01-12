import { cryptoDecrypt, decryptAES } from "../config/cryptoEncryption.js";

export default (req, res, next) => {
    try {

        let bodyData = req.body;
        if(global.requestEncryptFlag){
            req.x_auth = {
                secretKey: req.headers['x-key'],
                iv:  req.headers['x-iv']
            };
            if(req.x_auth.secretKey)
                req.x_auth.secretKey = cryptoDecrypt(req.x_auth.secretKey);
    
            if(Object.keys(req.body).length > 0) {
                bodyData = decryptAES(bodyData, req.x_auth.secretKey, req.x_auth.iv);
                try {
                    req.body = JSON.parse(bodyData);
                }catch(e) {
                    req.body ={};
                }
            }    
        }
    } catch(e) {
        global.log.error(` Internal server Error requestEncryption middleware - ${JSON.stringify({e: e.stack})}`);
        req.body ={}
    }
    next();
}


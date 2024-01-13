import {
  cryptoDecrypt,
  decryptAES,
  encryptAES,
  cryptoEncrypt,
  cryptoPublicDecrypt,
} from "../config/cryptoEncryption.js";
import jwt from "jsonwebtoken";
import Users from "../models/Users.js";
import Events from "../models/Events.js";

export default class SocketHandler {
  constructor(socket, message, user, isOldMsg= false) {
    this.headers = socket.handshake.headers;
    this.message = message;
    this.socket = socket;
    this.query = socket.handshake.query;
    this.user = user;
    this.isOldMsg = isOldMsg;
  }

  async init() {
    if (!this.headers && !this.message) {
      return;
    }
    if (global.requestEncryptFlag && !this.isOldMsg) {
      await this.decodeData();
    }
    if (typeof this.message == "string") {
      try {
        this.message = JSON.parse(this.message);
      } catch (e) {}
    }

    if (Object.keys(this.message).length <= 0) {
      return;
    }
    let recipents = {};
    recipents = this.isOldMsg ? this.user: await Users.findOne({ mobile: this.message.mobileNo });
    if (!recipents) {
      return;
    }
    let messageData = {
      ...this.message,
    };
    if(!this.isOldMsg) {
      messageData.mobileNo = this.user.mobile || "NA"
    }

    if (recipents.status == "online" && recipents.socketID) {
      if (global.requestEncryptFlag) {
        messageData = await this.encodeData(messageData, recipents);
      }
      global.log.error(`Socket recipent data-  ${JSON.stringify({messageData, recipents})}`);
      if(this.isOldMsg) {
        this.socket.emit("chatMessage", messageData);
        await Events.deleteMany({toUser: recipents._id});
      } else {
        this.socket.broadcast
        .to(recipents.socketID)
        .emit("chatMessage", messageData);
      }
      
    } else {
      await Events.findOneAndUpdate(
        {event: JSON.stringify(messageData)},
        { $setOnInsert: {
          toUser: recipents._id,
          event: JSON.stringify(messageData),
        }},
        { upsert: true, new: true, useFindAndModify: false }
      );
    }
  }

  static async sendUndeliveredMessages(socket, user) {
    if (!(user && user._id)) {
      return 0;
    }
    let promiseArray = [];
    let eventData = await Events.find({toUser: user._id});
    if (!(eventData && eventData.length > 0)) {
      return -1;
    }
    eventData.forEach((item) => {
      if (!item.event) {
        return;
      }
      
      promiseArray.push(
        ((socket, message, user) => {
          return new Promise(async (resolve, reject) => {
            try {
              const socketHandler = new SocketHandler(socket, message, user, true);
              await socketHandler.init();
              resolve(1);
            } catch (e) {
              reject(e);
            }
          });
        })(socket, item.event, user)
      );
    });

    let response = await Promise.allSettled(promiseArray);
    return response;
  }

  encodeData(messageData, recipents) {
    let iv = this.headers["x-iv"];
    let secretKey = this.headers["x-key"];
    if(recipents.encryption) {
      iv = recipents.encryption.iv;
      secretKey = recipents.encryption.secretKey
    } else{
      if (secretKey) secretKey = cryptoDecrypt(secretKey);
    }

    if (typeof messageData === "object") {
      messageData = JSON.stringify(messageData);
    }
    let data = encryptAES(messageData, secretKey, iv);
    return data;
  }

  decodeData() {
    let data = this.message;
    let iv = this.headers["x-iv"];
    let secretKey = this.headers["x-key"];

    if (secretKey) secretKey = cryptoDecrypt(secretKey);

    data = decryptAES(data, secretKey, iv);
    try {
      data = JSON.parse(data);
    } catch (e) {}
    this.message = data;
  }

  // decodeData2(data) {
  //     if( typeof data == 'string') {
  //         data = JSON.parse(data);
  //     }

  //     let iv = data['x-iv'];
  //     let secretKey =  data['x-key'];
  //     let payload = data.payload;

  //     if(secretKey)
  //         secretKey = cryptoPublicDecrypt(secretKey);

  //     data = decryptAES(payload, secretKey, iv);
  //     try {
  //         data = JSON.parse(data);
  //     }catch(e) {}

  //     console.log("data - ", data);
  // }

  static async updateUserStatus(type, data, socket) {
    let updateObj = {
      status: "away",
      socketID: data.socketID,
    };
    if(type == 'connected' ) {
      let iv = socket.handshake.headers["x-iv"];
      let secretKey = socket.handshake.headers["x-key"];
      if (secretKey) secretKey = cryptoDecrypt(secretKey);
      updateObj = {
        ...updateObj,
        status: 'online',
        encryption: {
          iv, secretKey
        }
      }
    }
    return await Users.findByIdAndUpdate(
      data._id, updateObj,
      { new: true, useFindAndModify: false } // Options to return the updated document and avoid deprecation warning
    );
  }

  static async validateUser(headers, auth) {
    let response = {
      status: false,
    };
    let token = auth.Authorization;
    try {
      token = token?.split(" ")[1] || "";
      if (!token) return response;

      const tokenDetails = jwt.verify(token, process.env.ACCESS_TOKEN_PK);
      if (tokenDetails._id) {
        response.user = await Users.findById(tokenDetails._id);
      }
    } catch (err) {
      global.log.error(`User Authrisation failed - ${JSON.stringify({e: err.stack, token})}`);
      return response;
    }
    return { ...response, status: true };
  }
}

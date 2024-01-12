import crypto from "crypto";
import fs from "fs";
const certificates = {};

// export const cryptoEncrypt = (data) => {
//   if (!certificates["public_key"]) {
//     certificates["public_key"] = fs.readFileSync(
//       global.ROOT_DIR + "/config/keys/public_key.txt",
//       "utf8"
//     );
//   }
//   const publicKey = certificates["public_key"];

//   return crypto
//     .publicEncrypt(
//       {
//         key: publicKey,
//         padding: crypto.constants.RSA_PKCS1_PADDING,
//       },
//       Buffer.from(data, "utf-8")
//     )
//     .toString("base64");
// };

// Creating a function to decrypt RSA
export const cryptoPublicDecrypt = (ciphertext) => {
  if (!certificates["public_key"]) {
        certificates["public_key"] = fs.readFileSync(
          global.ROOT_DIR + "/config/keys/public_key.txt",
          "utf8"
        );
      }

  const publicKey = certificates["public_key"];

  console.log({publicKey});
  const decrypted = crypto.publicDecrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    },
    Buffer.from(ciphertext, "base64")
  );
  return decrypted.toString("utf8");
};

export const cryptoEncrypt = (data) => {
  if (!certificates["private_key"]) {
    certificates["private_key"] = fs.readFileSync(
      global.ROOT_DIR + "/config/keys/private_key.txt",
      "utf8"
    );
  }
  const privateKey = certificates["private_key"];

  return crypto
    .privateEncrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      Buffer.from(data, "utf-8")
    )
    .toString("base64");
};

// Creating a function to decrypt RSA
export const cryptoDecrypt = (ciphertext) => {
  if (!certificates["private_key"]) {
    certificates["private_key"] = fs.readFileSync(
      global.ROOT_DIR + "/config/keys/private_key.txt",
      "utf8"
    );
  }
  const privateKey = certificates["private_key"];
  const decrypted = crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    },
    Buffer.from(ciphertext, "base64")
  );
  return decrypted.toString("utf8");
};

export const encryptAES = (plainText, securitykey, iv, serverEnc = false) => {
  if (typeof plainText == "object") {
      plainText = JSON.stringify(plainText);
  }
  if(serverEnc) {
    iv = crypto.randomBytes(16);
    securitykey = crypto.randomBytes(32);
  }

  securitykey = Buffer.from(securitykey, "base64");
  iv = Buffer.from(iv, "base64");
  
  const cipher = crypto.createCipheriv("aes-256-cbc", securitykey, iv);
  let encrypted = {
    cipher: Buffer.concat([cipher.update(plainText), cipher.final()]).toString(
      "base64"
    ),
    iv: iv.toString("base64"),
    securitykey: securitykey.toString("base64")
  };

  return !serverEnc? encrypted.cipher: encrypted;
};

export const decryptAES = (cipherText, securitykey, iv)  => {
  cipherText = Buffer.from(cipherText, "base64");
  securitykey = Buffer.from(securitykey, "base64");
  iv = Buffer.from(iv, "base64");

  const cipher = crypto.
      createDecipheriv("aes-256-cbc", securitykey, iv);
  return Buffer.
      concat([cipher.update(cipherText), cipher.final()]).
      toString('utf8');
}
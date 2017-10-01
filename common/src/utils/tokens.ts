const crypto = require("crypto");
const speakeasy = require("speakeasy");

function hash(secret: string): string {
  return crypto.createHash("sha256").update(secret).digest("base64");
}

export const Token = {
  create: (secret: string) => {
    const key = hash(secret);

    const token = speakeasy.totp({
      secret: key,
      encoding: "ascii"
    });

    return token;
  },

  verify: (secret: string, token: string) => {
    const key = hash(secret);

    return speakeasy.totp.verify({
      secret: key,
      encoding: "ascii",
      token: token,
      window: 10
    });
  },
};

import * as moment from "moment";
import { ICallback, IEventPayload, User } from "./types";
import { Users, UserInput, TokenInput } from "./connectors";
import {
  ValidationError,
  Errors,
  NOT_MATCH_ERROR_KEY,
  NOT_FOUND_ERROR_KEY
} from "@sf/common";

import * as jsonwebtoken from "jsonwebtoken";

export async function usersCreate(
  event: IEventPayload,
  context,
  callback: ICallback
) {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    const userInput: UserInput = JSON.parse(event.body);
    const userConnector = new Users();
    const ret = await userConnector.create(userInput);
    if (isUser(ret)) {
      const user: User = <User>ret;
      const privateKey = process.env.SECRET;
      const token = signJwt(user);
      const body = {
        token,
        user
      };
      const response = {
        statusCode: 200,
        body: JSON.stringify(body)
      };
      callback(undefined, response);
    } else {
      const response = {
        statusCode: 400,
        body: JSON.stringify(ret)
      };
      callback(undefined, response);
    }
  } catch (error) {
    console.log("error", error);
    // context.fail(errorMessage);
    const response = {
      statusCode: 500,
      body: JSON.stringify(error)
    };
    callback(undefined, response);
  }
}

export async function verifyToken(
  event: IEventPayload,
  context,
  callback: ICallback
) {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    const tokenInput: TokenInput = JSON.parse(event.body);
    const userConnector = new Users();
    const ret: any = await userConnector.verifyToken(tokenInput);
    if (ret.uid) {
      const user: User = <User>ret;
      const token = signJwt(user);
      const body = {
        token,
        user
      };
      const response = {
        statusCode: 200,
        body: JSON.stringify(body)
      };
      callback(undefined, response);
    } else {
      const error = <Errors>ret;
      if (
        error.errors &&
        error.errors[0] &&
        error.errors[0].uid &&
        error.errors[0].uid.key === NOT_FOUND_ERROR_KEY
      ) {
        const response = {
          statusCode: 200,
          body: JSON.stringify({ newUser: true })
        };
        callback(undefined, response);
        return;
      }
      const response = {
        statusCode: 401,
        body: JSON.stringify(error)
      };
      callback(undefined, response);
    }
  } catch (error) {
    console.log("error", error);
    // context.fail(errorMessage);
    const response = {
      statusCode: 500,
      body: JSON.stringify(error)
    };
    callback(undefined, response);
  }
}

function signJwt(user: User) {
  const { uid, phoneNumber, email } = user;
  const now = moment().unix();
  return jsonwebtoken.sign(
    {
      uid,
      alg: process.env.JWT_ALGORITHM,
      iss: process.env.FIREBASE_CLIENT_EMAIL,
      sub: process.env.FIREBASE_CLIENT_EMAIL,
      aud:
        "https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit",
      iat: now,
      exp: now + 60 * 60,
      claims: {
        phoneNumber,
        email,
        role: "user"
      }
    },
    process.env.FIREBASE_PRIVATE_KEY,
    {
      algorithm: process.env.JWT_ALGORITHM
    }
  );
}

function isUser(val: User | Errors): val is User {
  return (<User>val).uid !== undefined;
}

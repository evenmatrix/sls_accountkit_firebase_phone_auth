import * as underscore from "underscore";
import axios, { AxiosResponse } from "axios";
import {
  ValidationError,
  Errors,
  MIN_LENGTH_ERROR_KEY,
  REQUIRED_ERROR_KEY,
  REQUIRED_ERROR_KEY_MESSAGE,
  NOT_MATCH_ERROR_KEY,
  NOT_MATCH_ERROR_KEY_MESSAGE,
  UNIQUE_ERROR_KEY,
  UNIQUE_ERROR_KEY_MESSAGE,
  NOT_FOUND_ERROR_KEY,
  NOT_FOUND_ERROR_KEY_MESSAGE,
  UNKOWN_ERROR_KEY,
  UNKOWN_ERROR_KEY_MESSAGE,
  INVALID_ERROR_KEY,
  INVALID_ERROR_KEY_MESSAGE
} from "@sf/common";

import { required, oneOf, minLength, createValidator } from "../../utils";
import { User } from "../../types";
import { UserInput, TokenInput } from ".";
import { Firebase } from "../../libs";

const VALID_PROVIDERS: [string] = ["accountkit"];
const FIREBASE_INVALID_DISPLAY_NAME = "auth/invalid-display-name";
const FIREBASE_EMAIL_EXIST = "auth/email-already-exists";
const FIREBASE_USER_NOT_FOUND = "auth/user-not-found";
const FIREBASE_PHONE_NUMBER_EXISTS = "auth/phone-number-already-exists";

export class Users {
  static fromFirebaseError(error): ValidationError {
    if (error.code) {
      switch (error.code) {
        case FIREBASE_INVALID_DISPLAY_NAME:
          return {
            name: {
              key: INVALID_ERROR_KEY,
              message: INVALID_ERROR_KEY_MESSAGE
            }
          };
        case FIREBASE_EMAIL_EXIST:
          return {
            email: {
              key: UNIQUE_ERROR_KEY,
              message: UNIQUE_ERROR_KEY_MESSAGE
            }
          };
        case FIREBASE_USER_NOT_FOUND:
          return {
            uid: {
              key: NOT_FOUND_ERROR_KEY,
              message: NOT_FOUND_ERROR_KEY_MESSAGE
            }
          };
        case FIREBASE_PHONE_NUMBER_EXISTS:
          return {
            phoneNumber: {
              key: UNIQUE_ERROR_KEY,
              message: UNIQUE_ERROR_KEY_MESSAGE
            }
          };
        default:
          return {
            unkown: {
              key: UNKOWN_ERROR_KEY,
              message: error.message
            }
          };
      }
    }
    return {
      unkown: {
        key: UNKOWN_ERROR_KEY,
        message: error.message
      }
    };
  }
  static toErrors(error: ValidationError): Errors {
    return {
      errors: [error]
    };
  }

  validateToken(token: TokenInput): Errors {
    const { provider, accessToken } = token;
    let error = createValidator({ required, oneOf: oneOf(VALID_PROVIDERS) })({
      required: provider,
      oneOf: provider
    });
    if (!underscore.isEmpty(error)) {
      return Users.toErrors({
        provider: {
          key: REQUIRED_ERROR_KEY,
          message: REQUIRED_ERROR_KEY_MESSAGE
        }
      });
    }

    error = createValidator({ required })({ required: accessToken });
    if (!underscore.isEmpty(error)) {
      return Users.toErrors({
        accessToken: {
          key: REQUIRED_ERROR_KEY,
          message: REQUIRED_ERROR_KEY_MESSAGE
        }
      });
    }
  }

  async exchangeFacebookToken(token: TokenInput): Promise<AxiosResponse> {
    const { provider, accessToken } = token;
    const api_version = process.env.ACCOUNT_KIT_API_VERSION;
    const app_id = process.env.FACEBOOK_APP_ID;
    const app_secret = process.env.ACCOUNT_KIT_APP_SECRET;
    const me_endpoint_base_url = `https://graph.accountkit.com/${api_version}/me`;
    const token_exchange_base_url = `https://graph.accountkit.com/${api_version}/access_token`;

    const me_endpoint_url =
      me_endpoint_base_url + `?access_token=${accessToken}`;
    return await axios.get(me_endpoint_url);
  }

  async verifyToken(token: TokenInput): Promise<User | Errors> {
    let error = this.validateToken(token);
    if (error) {
      return error;
    }
    const res = await this.exchangeFacebookToken(token);
    try {
      if (res && res.data) {
        if (res.data.phone) {
          return await Firebase.auth().getUserByPhoneNumber(
            res.data.phone.number
          );
        } else if (res.data.email) {
          return await Firebase.auth().getUserByEmail(res.data.email);
        } else if (res.data.error) {
          error = res.data.error;
        }
      }
      if (error) {
        return Users.toErrors({
          provider: { key: UNKOWN_ERROR_KEY, message: UNKOWN_ERROR_KEY_MESSAGE }
        });
      }
    } catch (error) {
      return Users.toErrors(Users.fromFirebaseError(error));
    }
  }

  async create(userData: UserInput): Promise<User | Errors> {
    const { firstName, lastName, providerData } = userData;

    let error = createValidator({ required, minLength: minLength(2) })({
      required: firstName,
      minLength: firstName
    });
    if (!underscore.isEmpty(error)) {
      return Users.toErrors({
        firstName: {
          key: REQUIRED_ERROR_KEY,
          message: REQUIRED_ERROR_KEY_MESSAGE
        }
      });
    }

    error = createValidator({ required, minLength: minLength(2) })({
      required: lastName,
      minLength: lastName
    });
    if (!underscore.isEmpty(error)) {
      return Users.toErrors({
        lastName: {
          key: REQUIRED_ERROR_KEY,
          message: REQUIRED_ERROR_KEY_MESSAGE
        }
      });
    }
    error = this.validateToken(providerData);
    if (error) {
      return error;
    }
    const res = await this.exchangeFacebookToken(providerData);
    let phoneNumber;
    let email;
    try {
      if (res && res.data) {
        if (res.data.phone) {
          phoneNumber = res.data.phone.number;
        } else if (res.data.email) {
          email = res.data.email;
        } else if (res.data.error) {
          error = res.data.error;
        }
      }
      if (error) {
        return Users.toErrors({
          provider: { key: UNKOWN_ERROR_KEY, message: UNKOWN_ERROR_KEY_MESSAGE }
        });
      }
      return await Firebase.auth().createUser({
        email,
        phoneNumber,
        emailVerified: true,
        displayName: `${firstName} ${lastName}`,
        disabled: false
      });
    } catch (error) {
      return Users.toErrors(Users.fromFirebaseError(error));
    }
  }
}

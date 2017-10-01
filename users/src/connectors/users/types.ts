import { User } from "../../types/users";

export interface UserInput {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  providerData?: TokenInput;
}

export interface UserResponse {
  user: User;
}

export interface TokenInput {
  provider: string;
  accessToken: string;
}

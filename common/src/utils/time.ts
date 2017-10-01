import * as moment from "moment";
import { or, equals, contains } from "ramda";

export const time = (value) => {
  return moment(value).utc().format("YYYY-MM-DDTHH:mmZ");
};

export const date = (value) => {
  return moment(value).format("YYYY-MM-DD");
};



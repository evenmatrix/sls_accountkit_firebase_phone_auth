import * as moment from "moment-timezone";
import { or, equals, contains } from "ramda";

export const defaultTimeZone = "America/Chicago";

export const time = (value) => {
  return moment(value).utc().format("YYYY-MM-DDTHH:mmZ");
};

export const date = (value) => {
  return moment(value).format("YYYY-MM-DD");
};

export const timestamp = () => moment().toISOString();



const BigNumber = require("bignumber.js");

export const currency = (value) => new BigNumber(value).toFixed(2);
export const cents = (value) => new BigNumber(value).times(100).toFixed(0);

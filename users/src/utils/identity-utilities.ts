const BigNumber = require("bignumber.js");

/**
 * Creates a reasonably compact, url safe, version of
 * a string
 *
 * @param value string to encode
 * @returns {string} encoded string
 */
function encode(value: string): string {
  const hex = Buffer.from(value, "utf8").toString("hex");
  return new BigNumber(hex, 16).toString(61);
}

/**
 * Returns a compacted string to it's original form.
 *
 * @param value string to decode
 * @returns {string} decoded string
 */
function decode(value: string): string {
  try {
    const hex = new BigNumber(value, 61).toString(16);
    return Buffer.from(hex, "hex").toString("utf8");
  } catch (e) {
    throw Error(`Unable to decode identifier "${e}"`);
  }
}

export function unpackId(source: string, type: string): string {
  const { domain, id } = globalId(source);

  if (type === domain) {
    return id;
  } else {
    throw Error(`${source} is not id type ${type}`);
  }
}

/**
 * Encodes a raw system id and type for extraction
 * with #unpackId
 *
 * @param id system id to encode
 * @param type namespace of the encoded id
 *
 * @returns {string} the encoded id
 */
export function packId(id: string, type: string): string {
  return encode(`${type}:${id}`);
}

export function globalId(source: string): { domain: string, id: string } {
  const [domain, id] = source.split(":");
  if (id === undefined) {
    return globalId(decode(domain));
  }

  return { domain, id };
}

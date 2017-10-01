import { v1 } from "uuid";

/**
 * Generates a sortable identifier.
 *
 * RFC 4122 specifies an explicit ordering of the fields - http://tools.ietf.org/html/rfc4122#section-4.1.2
 * for v1 uuids. It puts the low fields of the timestamp at the front of the string.
 *
 * In order to use a time based uuid we swap the 1st and 3rd fields (separated by '-'),
 * then order lexicographically.
 *
 * @return string: newly created id
 */
export function generateId(): string {
  const id  = v1();

  // flip the fields for time ordering
  return id.replace(/^(.{8})-(.{4})-(.{4})/, "$3-$2-$1");
}



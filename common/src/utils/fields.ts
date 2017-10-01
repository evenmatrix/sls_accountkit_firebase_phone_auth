import * as R from "ramda";

import { packId } from "./identity-utilties";

export type Transformer = (value, source) => any;

const identity = (value: any, source: any) => value;

export function field(name: string, missing: any = null, transformer: Transformer = identity) {
  return (source: any) => {
    const value = source[ name ];
    return value !== undefined ? transformer(value, source) : missing;
  };
}

export function object(name: string, missing: any = {}, transformer: Transformer = identity) {
  return field(name, missing, transformer);
}

export function array(name: string, transformer: Transformer = identity) {
  return field(name, [], transformer);
}

export function nodeId(namespace: string) {
  return field("id", null, (id) => packId(id, namespace));
}

export function point(name: string, missing: any = null, transformer: Transformer = identity) {
  return field(name, missing, (p) => ({
    latitude: R.last(p.coordinates),
    longitude: R.head(p.coordinates),
  }));
};

export function nullable(value, action) {
  return (undefined === value || null === value) ? null : action(value);
}

export function objectOrKey(value, lookup) {
  if (value !== null && typeof value === "object") {
    return value;
  }

  return (nullable(value, lookup));
}

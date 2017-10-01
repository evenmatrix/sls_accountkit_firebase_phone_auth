import { Map } from "immutable";
const keypath = require("keypather")();

const identity = (v: any) => v;

export type RemapMapping = ConstantMapping | TransformationMapping;

export type ConstantMapping = {
  value: any;
  destination: string;
};

export type TransformationMapping = {
  source: string;
  destination: string;
  transformer?: (value: any) => any;
};

function isConstant(mapping: RemapMapping): mapping is ConstantMapping {
  return (<ConstantMapping>mapping).value !== undefined;
}

function mapConstant(destination: Map<string, any>, constant: ConstantMapping) {
  const location = constant.destination.split(".");
  return destination.setIn(location, constant.value);
}

function mapTransformation(source: Object, destination: Map<string, any>, transformation: TransformationMapping) {
  const value = keypath.get(source, transformation.source);
  const transformer = transformation.transformer || identity;

  const location = transformation.destination.split(".");
  return (value !== undefined) ? destination.setIn(location, transformer(value)) : destination;
}

export function remap(source, transforms: RemapMapping[]) {
  const remapped = transforms.reduce((previous: Map<string, any>, transformation) => {

    return isConstant(transformation)
      ? mapConstant(previous, transformation)
      : mapTransformation(source, previous, transformation);

  }, Map<string, any>());

  return remapped.toJS();
}

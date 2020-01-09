import { shape } from './queries';

export const automationFields = `
  _id
  name
  description: String;
  status: String;
  userId?: String;
  createdAt?: Date;
  publishedAt?: Date;
  modifiedAt?: Date;
  modifiedBy?: String;
  shapes: [Shape];
`;

export const commonVariables = `
  $name: String
  $description: String
`;

export const commonParams = `
  name: $name
  description: $description
`;

const automationsAdd = `
  mutation automationsAdd(
    ${commonVariables}
  ) {
    automationsAdd(
      ${commonParams}
    ) {
      ${automationFields}
    }
  }
`;

const automationsEdit = `
  mutation automationsEdit(
    $_id: String!,
    ${commonVariables}
  ) {
    automationsEdit(
      _id: $_id,
      ${commonParams}
    ) {
      ${automationFields}
    }
  }
`;

const automationsRemove = `
  mutation automationsRemove($_id: String!) {
    automationsRemove(_id: $_id) {
      _id
    }
  }
`;

// shapes

const shapeVariables = `
  $automationId: String;
  $type: String;
  $kind: String;
  $position: JSON;
  $size: JSON;
  $toArrow: [String];
  $config: JSON;
`;

const shapeParams = `
  automationId: $automationId;
  type: $type;
  kind: $kind;
  position: $position;
  size: $size;
  toArrow: $toArrow;
  config: $config;
`;

const shapesAdd = `
  mutation shapesAdd(
    ${shapeVariables}
  ) {
    shapesAdd(
      ${shapeParams}
    ) {
      ${shape}
    }
  }
`;

const shapesEdit = `
  mutation shapesEdit(
    $_id: String!,
    ${shapeVariables}
  ) {
    shapesEdit(
      _id: $_id,
      ${shapeParams}
    ) {
      ${shape}
    }
  }
`;

const shapesRemove = `
  mutation shapesRemove($_id: String!) {
    shapesRemove(_id: $_id) {
      _id
    }
  }
`;

export default {
  automationsAdd,
  automationsEdit,
  automationsRemove,
  shapesAdd,
  shapesEdit,
  shapesRemove
};

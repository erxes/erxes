import gql from "graphql-tag";

const commonFields = `
  $mainType: String,
  $mainTypeId: String,
  $relType: String,
  $relTypeId: String,
`;

const commonVariables = `
  mainType: $mainType,
  mainTypeId: $mainTypeId,
  relType: $relType,
  relTypeId: $relTypeId,
`;

const commonCreateFields = `
  $mainType: String,
  $mainTypeId: String,
  $relType: String,
  $relTypeIds: [String]
`;

const commonCreateVariables = `
  mainType: $mainType,
  mainTypeId: $mainTypeId,
  relType: $relType,
  relTypeIds: $relTypeIds
`;

export const CONFORMITY_ADD = gql`
  mutation conformityAdd(${commonFields}) {
    conformityAdd(${commonVariables}) {
      _id
    }
  }
`;

export const CONFORMITY_EDIT = gql`
  mutation conformityEdit(${commonCreateFields}) {
    conformityEdit(${commonCreateVariables}) {
      success
    }
  }
`;
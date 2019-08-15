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

const conformityAdd = `
  mutation conformityAdd(${commonFields}) {
    conformityAdd(${commonVariables}) {
      _id
    }
  }
`;

const conformityCreate = `
  mutation conformityCreate(${commonCreateFields}) {
    conformityCreate(${commonCreateVariables}) {
      success
    }
  }
`;

export default {
  conformityAdd,
  conformityCreate
};

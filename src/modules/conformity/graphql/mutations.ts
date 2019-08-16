const commonFields = `
  $mainType: String,
  $mainTypeIds: [String],
  $relType: String,
  $relTypeId: String,
`;

const commonVariables = `
  mainType: $mainType,
  mainTypeIds: $mainTypeIds,
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

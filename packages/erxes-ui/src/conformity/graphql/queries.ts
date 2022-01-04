export const conformityQueryFields = `
  $mainType: String,
  $mainTypeId: String,
  $isRelated: Boolean,
  $isSaved: Boolean,
`;

export const conformityQueryFieldDefs = `
  conformityMainType: $mainType,
  conformityMainTypeId: $mainTypeId,
  conformityIsRelated: $isRelated,
  conformityIsSaved: $isSaved,
`;

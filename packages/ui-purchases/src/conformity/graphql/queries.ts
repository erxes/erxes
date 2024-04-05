export const conformityQueryFields = `
  $mainType: String,
  $mainTypeId: String,
  $relType: String,
  $isRelated: Boolean,
  $isSaved: Boolean,
`;

export const conformityQueryFieldDefs = `
  conformityMainType: $mainType,
  conformityMainTypeId: $mainTypeId,
  conformityRelType: $relType,
  conformityIsRelated: $isRelated,
  conformityIsSaved: $isSaved,
`;

export const riskAssessmentDef = `
    $categoryId: String!,
    $description: String!,
    $name: String!,
    $status: String!
`;

export const riskAssessmentValues = `
    categoryId: $categoryId,
    description: $description,
    name: $name,
    status: $status
`;

export const riskAssessmentParams = `
    _id,name,description,status,categoryId
`;

export const riskAssessmentCategoryParams = `
_id
formId
parentName
name
`;

export const commonTypes = `
    createdAt:String
    modifiedAt:String
`;

export const commonPaginateTypes = `
    page:Int
    perPage:Int
    sortField: String,
    sortDirection: Int,
`;

export const commonRiskAssessmentTypes = `
    _id: String
    name: String!
    description: String!
    categoryId: String!
    status: String!
`;

export const commonRiskConfirmityTypes = `
    _id: String!,
    cardId: String!,
    riskAssessmentId: String!,
`;

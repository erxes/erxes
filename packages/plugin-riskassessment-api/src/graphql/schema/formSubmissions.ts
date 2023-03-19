export const types = `
`;

const commonFormSubmissionsTypes = `
    cardId: String,
    cardType: String,
    riskAssessmentId: String,
    userId: String,
    fieldId: String,
    indicatorId: String,
    formSubmissions:JSON,
    branchId:String,
    departmentId:String,
    operationId:String,
`;

export const mutations = `
    riskFormSaveSubmissions(${commonFormSubmissionsTypes}):JSON
`;

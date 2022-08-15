export const types = `
    type CategoryField {
        _id: String
        name: String
        formId: String
        parentName: String
    }

    input CategoryFieldInput {
        _id: String
        name: String
        formId: String
        parentName: String
    }
`;
export const queries = `
    getRiskAssesmentCategory:[CategoryField]
`;
export const mutations = `
    addAssessmentCategory (name: String,formId: String,parentName: String):JSON
`;

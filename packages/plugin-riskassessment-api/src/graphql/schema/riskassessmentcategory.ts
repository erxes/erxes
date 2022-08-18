import { commonAssessmentCategoryTypes } from './common';

export const types = `
    type CategoryField {
        ${commonAssessmentCategoryTypes}
    }

    type CategoryMainField {
        ${commonAssessmentCategoryTypes}
        code: String
        order: String
        parent: CategoryField
        formName: String
    }


    input CategoryFieldInput {
        _id: String
        name: String
        formId: String
        parentId: String
    }
`;
export const queries = `
    getRiskAssesmentCategories:[CategoryMainField]
    getRiskAssesmentCategory(_id: String!): CategoryMainField
`;
export const mutations = `
    addAssessmentCategory (name: String,formId: String,parentId: String,code: String):JSON
    removeAssessmentCategory (_id:String):JSON
    editAssessmentCategory(_id:String,name: String,formId: String,parentId: String,code: String):JSON
`;

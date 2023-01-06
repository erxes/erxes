import { commonFormSubmissionsTypes } from './common';

export const types = `
    type FormSubmissionFieldType{
        fieldId: String
        value: String
        optionsValues:[String]
        text: String
        description: String
    }

    type FormSubmissionUserType {
        _id:String
        user:JSON
        fields:[FormSubmissionFieldType]
    }

    type RiskFormSubmission {
        cardId:String
        cardType:String
        card:JSON
        riskAssessmentId:String
        riskAssessment:JSON
        formId:String
        users:[FormSubmissionUserType]
    }
`;
export const queries = `
    riskFormSubmitHistory (cardId:String,cardType:String,riskAssessmentId:String):RiskFormSubmission
`;
export const mutations = `
    riskFormSaveSubmissions(${commonFormSubmissionsTypes}):JSON
`;

export const types = `
    input ICustomScore {
        value:Int
        description:String
    }
`;

const commonFormSubmissionsTypes = `
    cardId: String,
    cardType: String,
    riskAssessmentId: String,
    userId: String,
    fieldId: String,
    indicatorId: String,
    customScore:ICustomScore,
    formSubmissions:JSON
`;

export const mutations = `
    riskFormSaveSubmissions(${commonFormSubmissionsTypes}):JSON
`;

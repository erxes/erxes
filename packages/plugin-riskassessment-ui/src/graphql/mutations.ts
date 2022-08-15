import { riskAssessmentDef, riskAssessmentValues } from '../common/graphql';

export const types = `
input RiskAssessmentInput {
  name: String
  description: String
  categoryId: String
  status: String
}
`;

const riskAssessmentAdd = `
  mutation AddRiskAssesment(${riskAssessmentDef}) {
    addRiskAssesment(${riskAssessmentValues})
  }
`;

const riskAssesmentRemove = `
  mutation RemoveRiskAssessment($_ids:[String]){
    removeRiskAssessment(_ids: $_ids)
  }
`;

const riskAssessmentUpdate = `
  mutation UpdateRiskAssessment($_id:String,$doc:RiskAssessmentInput){
    updateRiskAssessment(_id: $_id,doc:$doc)
  }
`;

export default {
  riskAssessmentAdd,
  riskAssesmentRemove,
  riskAssessmentUpdate,
};

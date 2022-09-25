import { riskAssessmentDef, riskAssessmentValues } from '../common/graphql';

export const types = `
input RiskAssessmentInput {
  name: String
  description: String
  categoryId: String
  status: String
  calculateMethod:String
  calculateLogics:[CalculateLogicInput]
}
input CalculateLogicInput {
  _id: String,
  name: String,
  value: Int
  value2:Int
  logic: String
  color: String
}
`;

const riskAssessmentAdd = `
  mutation AddRiskAssesment(${riskAssessmentDef},$calculateLogics:[CalculateLogicInput]) {
    addRiskAssesment(${riskAssessmentValues},calculateLogics:$calculateLogics)
  }
`;

const riskAssesmentRemove = `
  mutation RemoveRiskAssessment($_ids:[String]){
    removeRiskAssessment(_ids: $_ids)
  }
`;

const riskAssessmentUpdate = `
  mutation UpdateRiskAssessment($id:String,$doc:RiskAssessmentInput){
    updateRiskAssessment(_id: $id,doc:$doc)
  }
`;

export default {
  riskAssessmentAdd,
  riskAssesmentRemove,
  riskAssessmentUpdate
};

import {
  commonConformityParams,
  commonConformityParamsDef,
  commonFormSaveParams,
  commonFormSaveParamsDef
} from '../common/graphql';

const addConformity = `
  mutation AddRiskConformity(${commonConformityParams}) {
    addRiskConformity(${commonConformityParamsDef}) {
      cardId
      _id
      riskAssessmentId
    }
  }
`;
const editConformity = `
  mutation UpdateRiskConformity(${commonConformityParams}) {
    updateRiskConformity(${commonConformityParamsDef}) {
      _id
      cardId
      cardType
      riskIndicatorIds
    }
  }
`;

const removeConformity = `
  mutation RemoveRiskConformity($cardId: String,$cardType:String) {
    removeRiskConformity(cardId: $cardId,cardType:$cardType) 
  }
`;

const riskFormSaveSubmission = `
  mutation RiskFormSaveSubmissions(${commonFormSaveParams}) {
    riskFormSaveSubmissions(${commonFormSaveParamsDef})
  }
`;

export default {
  addConformity,
  editConformity,
  removeConformity,
  riskFormSaveSubmission
};

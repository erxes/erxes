import { models } from './connectionResolver';

export const validRiskAssessment = async params => {
  if (!params.categoryId) {
    throw new Error('Please select some category');
  }
  if (await models?.RiskAssessment.findOne({ name: params.name })) {
    console.log(await models?.RiskAssessment.findOne({ name: params.name }));
    throw new Error('This risk assessment is already in use. Please type another name');
  }
};

export const calculateRiskAssessment = async (models, subdomain, cardId) => {
  models.RiskAssessment.findOne({});
};

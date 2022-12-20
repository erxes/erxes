import { models } from './connectionResolver';
import {
  sendCardsMessage,
  sendCoreMessage,
  sendFormsMessage
} from './messageBroker';

export const validRiskAssessment = async params => {
  if (!params.categoryId) {
    throw new Error('Please select some category');
  }
  if (!params.calculateMethod) {
    throw new Error('Please select calculate method');
  }
  if (await models?.RiskAssessment.findOne({ name: params.name })) {
    throw new Error(
      'This risk assessment is already in use. Please type another name'
    );
  }

  const { calculateLogics } = params;

  if (!calculateLogics || !calculateLogics.length) {
    throw new Error(
      'You must specify at least one logics to calculate the risk assessment'
    );
  }

  for (const logic of calculateLogics) {
    if (!logic.logic) {
      throw new Error(
        `${logic.name} calculate logic should not be empty.Please select a logic`
      );
    }
    if (!logic.color) {
      throw new Error(
        `${logic.name} calculate status color should not be empty.Please select some color`
      );
    }
    if (!logic.value || logic.value === 0) {
      throw new Error(
        `${logic.name} calculate value should be greather than zero`
      );
    }
  }
};

export const calculateRiskAssessment = async (models, cardId, cardType) => {
  const {
    riskAssessmentId,
    resultScore,
    status
  } = await models.RiskConformity.findOne({
    cardId,
    cardType
  }).lean();

  const { calculateLogics } = await models.RiskAssessment.findOne({
    _id: riskAssessmentId
  }).lean();

  for (const { name, value, value2, logic, color } of calculateLogics) {
    let operator = logic.substring(1, 2);
    if (operator === '≈') {
      if (value < resultScore && resultScore < value2) {
        return await models.RiskConformity.findOneAndUpdate(
          { _id: riskAssessmentId },
          { $set: { status: name, statusColor: color, closedAt: Date.now() } },
          { new: true }
        );
      }
    }
    if (['>', '<'].includes(operator)) {
      operator += '=';
      if (eval(resultScore + operator + value)) {
        return await models.RiskConformity.findOneAndUpdate(
          { riskAssessmentId, cardId, cardType },
          { $set: { status: name, statusColor: color, closedAt: Date.now() } },
          { new: true }
        );
      }
    }

    if (status === 'In Progress') {
      return await models.RiskConformity.findOneAndUpdate(
        { riskAssessmentId, cardId, cardType },
        {
          $set: {
            status: 'No Result',
            statusColor: '#888',
            closedAt: Date.now()
          }
        },
        { new: true }
      );
    }
  }
};

export const checkAllUsersSubmitted = async (
  subdomain,
  model,
  cardId: string,
  cardType: string
) => {
  let result = false;

  const assignedUsers = await getAsssignedUsers(subdomain, cardId, cardType);

  const formId = await getFormId(model, cardId, cardType);

  const assignedUserIds = assignedUsers.map(usr => usr._id);
  const submissions = await model.RiksFormSubmissions.find({
    cardId,
    formId,
    userId: { $in: assignedUserIds }
  }).lean();

  const groupedSubmissions = {};

  for (const submission of submissions) {
    groupedSubmissions[submission.userId] = submission;
  }

  if (Object.keys(groupedSubmissions).length === assignedUsers.length) {
    result = true;
  }
  return result;
};

export const getAsssignedUsers = async (
  subdomain,
  cardId: string,
  cardType: string
) => {
  let assignedUsers;
  const card = await sendCardsMessage({
    subdomain,
    action: `${cardType}s.findOne`,
    data: {
      _id: cardId
    },
    isRPC: true,
    defaultValue: []
  });

  if (card) {
    const { assignedUserIds } = card;

    assignedUsers = await sendCoreMessage({
      subdomain,
      action: 'users.find',
      data: {
        query: { _id: { $in: assignedUserIds } }
      },
      isRPC: true,
      defaultValue: []
    });
  }

  return assignedUsers;
};

export const getFormId = async (model, cardId: string, cardType: String) => {
  const { riskAssessmentId } = await model.RiskConformity.findOne({
    cardId,
    cardType
  }).lean();
  const { categoryId } = await model.RiskAssessment.findOne({
    _id: riskAssessmentId
  }).lean();

  const { formId } = await model.RiskAssessmentCategory.findOne({
    _id: categoryId
  }).lean();
  return formId;
};

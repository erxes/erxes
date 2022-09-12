import { models } from './connectionResolver';
import { sendCardsMessage, sendCoreMessage, sendFormsMessage } from './messageBroker';

export const validRiskAssessment = async (params) => {
  if (!params.categoryId) {
    throw new Error('Please select some category');
  }
  if (await models?.RiskAssessment.findOne({ name: params.name })) {
    throw new Error('This risk assessment is already in use. Please type another name');
  }
};

export const calculateRiskAssessment = async (models, subdomain, cardId, formId) => {
  const { riskAssessmentId } = await models.RiskConfimity.findOne({ cardId }).lean();

  const submissions = await models.RiksFormSubmissions.find({ cardId, formId, riskAssessmentId });
  const { calculateLogics } = await models.RiskAssessment.findOne({ _id: riskAssessmentId }).lean();

  const query = { contentType: 'form', contentTypeId: formId };
  const fields = await sendFormsMessage({
    subdomain,
    action: 'fields.find',
    data: { query },
    isRPC: true,
    defaultValue: [],
  });

  let sumNumber = 0;

  for (const submission of submissions) {
    const { optionsObj } = fields.find((field) => field._id === submission.fieldId);
    const fieldValue = optionsObj.find((option) => option.label === submission.value);
    sumNumber += parseInt(fieldValue.value);
  }
  for (const { name, value, value2, logic, color } of calculateLogics) {
    const operator = logic.substring(1, 2);
    if (operator === '≈') {
      if (value < sumNumber && sumNumber < value2) {
        return await models.RiskAssessment.findOneAndUpdate(
          { _id: riskAssessmentId },
          { $set: { status: name, statusColor: color } },
          { new: true }
        );
      }
    }
    if (['>', '<'].includes(operator)) {
      if (eval(sumNumber + operator + value)) {
        console.log(sumNumber, operator, value);
        await models.RiskAssessment.findOneAndUpdate(
          { _id: riskAssessmentId },
          { $set: { status: name, statusColor: color } },
          { new: true }
        );
      }
    }
  }
};

export const checkAllUsersSubmitted = async (subdomain, model, cardId: string) => {
  let result = false;

  const assignedUsers = await getAsssignedUsers(subdomain, cardId);

  const formId = await getFormId(model, cardId);

  const assignedUserIds = assignedUsers.map((usr) => usr._id);
  const submissions = await model.RiksFormSubmissions.find({
    cardId,
    formId,
    userId: { $in: assignedUserIds },
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

export const getAsssignedUsers = async (subdomain, dealId: string) => {
  let assignedUsers;
  const deal = await sendCardsMessage({
    subdomain,
    action: 'deals.findOne',
    data: {
      _id: dealId,
    },
    isRPC: true,
    defaultValue: [],
  });

  if (deal) {
    const { assignedUserIds } = deal;

    assignedUsers = await sendCoreMessage({
      subdomain,
      action: 'users.find',
      data: {
        query: { _id: { $in: assignedUserIds } },
      },
      isRPC: true,
      defaultValue: [],
    });
  }

  return assignedUsers;
};

export const getFormId = async (model, cardId: string) => {
  const { riskAssessmentId } = await model.RiskConfimity.findOne({ cardId }).lean();
  const { categoryId } = await model.RiskAssessment.findOne({ _id: riskAssessmentId }).lean();

  const { formId } = await model.RiskAssessmentCategory.findOne({ _id: categoryId }).lean();
  return formId;
};

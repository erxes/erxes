import { models } from './connectionResolver';
import {
  sendCardsMessage,
  sendCoreMessage,
  sendFormsMessage
} from './messageBroker';

export const validRiskIndicators = async params => {
  if (!params.categoryId) {
    throw new Error('Please select some categories');
  }
  if (await models?.RiskIndicators.findOne({ name: params.name })) {
    throw new Error(
      'This risk assessment is already in use. Please type another name'
    );
  }

  const { forms, customScoreField } = params;

  let percentWeight = 0;

  if (customScoreField) {
    percentWeight += customScoreField;
  }

  if (!forms.length) {
    throw new Error('Please add a form to the risk assessment');
  }

  for (const form of forms) {
    if (!form.formId) {
      throw new Error('Please build a form');
    }
    if (!form.calculateMethod) {
      throw new Error('Provide a calculate method on form');
    }
    if (forms.length > 1) {
      if (!form.percentWeight) {
        throw new Error('Provide a percent weigth on form');
      }
    }

    percentWeight += form.percentWeight;
  }

  if (forms.length > 1) {
    if (percentWeight > 100) {
      throw new Error(`all percentages must add up to 100`);
    }
  }
};

export const validateCalculateMethods = async params => {
  if (!params.calculateMethod) {
    throw new Error(
      'You must specify calculate method of general configuration'
    );
  }
  if (!params.calculateLogics.length) {
    throw new Error('You must specify at least one calculate logic');
  }
  for (const calculateLogic of params.calculateLogics || []) {
    if (!calculateLogic.logic) {
      throw new Error('You must specify calculate logic ');
    }
    if (!calculateLogic.name) {
      throw new Error('You must specify calculate name ');
    }
    if (!calculateLogic.value) {
      throw new Error('You must specify calculate value ');
    }
    if (!calculateLogic.color) {
      throw new Error('You must specify calculate status color ');
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
          { riskAssessmentId, cardId, cardType },
          {
            $set: {
              status: name,
              statusColor: color,
              closedAt: Date.now()
            }
          },
          { new: true }
        );
      }
    }
    if (['>', '<'].includes(operator)) {
      operator += '=';
      if (eval(resultScore + operator + value)) {
        return await models.RiskConformity.findOneAndUpdate(
          { riskAssessmentId, cardId, cardType },
          {
            $set: {
              status: name,
              statusColor: color,
              closedAt: Date.now()
            }
          },
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
  cardType: string,
  formIds: string[]
) => {
  let result = false;

  const assignedUsers = await getAsssignedUsers(subdomain, cardId, cardType);

  const assignedUserIds = assignedUsers.map(usr => usr._id);
  const submissions = await model.RiksFormSubmissions.find({
    cardId,
    formId: { $in: formIds },
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

export const calculateFormResponses = async ({
  responses,
  fields,
  calculateMethod,
  filter
}) => {
  let sumNumber = 0;
  const submissions: any = [];

  if (calculateMethod === 'Multiply') {
    sumNumber = 1;
  }

  for (const [key, value] of Object.entries(responses)) {
    const field = fields.find(field => field._id === key);

    if (field?.optionsValues) {
      const optValues = field?.optionsValues
        .split('\n')
        .map(item => {
          if (item.match(/=/g)) {
            const label = item?.substring(0, item.indexOf('='));
            const value = parseInt(
              item.substring(item?.indexOf('=') + 1, item.length)
            );
            if (!Number.isNaN(value)) {
              return { label, value };
            }
          }
        }, [])
        .filter(item => item);
      const fieldValue = optValues.find(option => option.label === value);
      switch (calculateMethod) {
        case 'Multiply':
          sumNumber *= parseInt(fieldValue?.value || 0);
          break;
        case 'Addition':
          sumNumber += parseInt(fieldValue?.value || 0);
          break;
      }
      submissions.push({
        ...filter,
        formId: field?.contentTypeId,
        fieldId: key,
        value
      });
    } else {
      submissions.push({
        ...filter,
        formId: field?.contentTypeId,
        fieldId: key,
        value
      });
    }
  }

  return { submissions, sumNumber };
};

export const getFieldsGroupByForm = async ({
  subdomain,
  formId,
  formIds
}: {
  subdomain: string;
  formId?: string;
  formIds?: string[];
}) => {
  let submissionForms: any[] = [];
  const fields = await sendFormsMessage({
    subdomain,
    action: 'fields.find',
    data: {
      query: {
        contentType: 'form',
        contentTypeId: formIds ? { $in: formIds } : formId
      }
    },
    isRPC: true,
    defaultValue: []
  });

  for (const field of fields) {
    if (submissionForms.find(form => form.formId === field.contentTypeId)) {
      submissionForms = submissionForms.map(form =>
        form.formId === field.contentTypeId
          ? { ...form, fields: [...form.fields, field] }
          : form
      );
    } else {
      const { title } = await sendFormsMessage({
        subdomain,
        action: 'findOne',
        data: { _id: field.contentTypeId },
        isRPC: true,
        defaultValue: {}
      });

      submissionForms.push({
        formId: field.contentTypeId,
        formTitle: title || '',
        fields: [field]
      });
    }
  }

  return submissionForms;
};

export const riskAssessmentIndicator = async ({
  models,
  subdomain,
  cardId,
  cardType,
  riskAssessmentId,
  riskIndicatorId
}) => {
  const assignedUserIds = (
    await getAsssignedUsers(subdomain, cardId, cardType)
  ).map(user => user._id);

  const submissions = await models.RiksFormSubmissions.find({
    cardId,
    riskAssessmentId,
    riskIndicatorId,
    userId: { $in: assignedUserIds }
  });

  let submittedUsers: any = {};

  for (const submission of submissions) {
    submittedUsers[submission.userId] = submission;
  }

  return Object.keys(submittedUsers).length === assignedUserIds.length;
};

export const checkEveryUserSubmitted = {
  riskAssessmentIndicator: riskAssessmentIndicator
};

export const calculateResult = async ({
  collection,
  calculateLogics,
  resultScore,
  filter
}) => {
  for (const { name, value, value2, logic, color } of calculateLogics || []) {
    let operator = logic.substring(1, 2);
    if (operator === '≈') {
      if (value < resultScore && resultScore < value2) {
        return await collection.findOneAndUpdate(
          { ...filter },
          {
            $set: {
              status: name,
              statusColor: color,
              resultScore,
              closedAt: Date.now()
            }
          },
          { new: true }
        );
      }
    }
    if (['>', '<'].includes(operator)) {
      operator += '=';
      if (eval(resultScore + operator + value)) {
        return await collection.findOneAndUpdate(
          { ...filter },
          {
            $set: {
              status: name,
              statusColor: color,
              resultScore,
              closedAt: Date.now()
            }
          },
          { new: true }
        );
      }
    }

    const doc = await collection.findOne({ ...filter });

    if ((await doc.status) === 'In Progress') {
      return await collection.findOneAndUpdate(
        { ...filter },
        {
          $set: {
            status: 'No Result',
            statusColor: '#888',
            resultScore,
            closedAt: Date.now()
          }
        },
        { new: true }
      );
    }
  }
};

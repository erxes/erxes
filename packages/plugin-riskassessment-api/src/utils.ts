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
  if (await models?.RiskAssessment.findOne({ name: params.name })) {
    throw new Error(
      'This risk assessment is already in use. Please type another name'
    );
  }

  const { forms } = params;

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
    if (!form.percentWeight) {
      throw new Error('Provide a percent weigth on form');
    }

    const { calculateLogics } = form;

    if (!calculateLogics || !calculateLogics.length) {
      throw new Error(
        'You must specify at least one logics to calculate the form'
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

  const { calculateLogics, forms } = await models.RiskAssessment.findOne({
    _id: riskAssessmentId
  }).lean();

  if (forms.length === 1) {
    const [form] = forms;
    for (const { name, value, value2, logic, color } of form.calculateLogics) {
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

import { generateModels } from './connectionResolver';
import { sendCoreMessage, sendFormsMessage } from './messageBroker';

const getContactDetail = async (subdomain, contentType, contentTypeId) => {
  const models = await generateModels(subdomain);

  let contact;

  if (contentType === 'contacts:customer') {
    contact = await models.Customers.findOne({ _id: contentTypeId });
  }
  if (contentType === 'contacts:company') {
    contact = await models.Companies.findOne({ _id: contentTypeId });
  }

  return contact;
};

const getFields = async ({ subdomain, contentType }) => {
  const fields = await sendFormsMessage({
    subdomain,
    action: 'fields.fieldsCombinedByContentType',
    isRPC: true,
    data: {
      contentType
    },
    defaultValue: []
  });
  return fields.map(f => ({ value: f.name, name: f.label }));
};

export default {
  types: [
    {
      label: 'Customer',
      type: 'contacts:customer'
    },
    {
      label: 'Company',
      type: 'contacts:company'
    }
  ],

  editorAttributes: async ({ subdomain, data: { contentType } }) => {
    return await getFields({ subdomain, contentType });
  },
  replaceContent: async ({
    subdomain,
    data: { contentTypeId, content, contentType }
  }) => {
    const contact = await getContactDetail(
      subdomain,
      contentType,
      contentTypeId
    );

    if (!contact) {
      return '';
    }

    let replacedContent: any = content || {};

    ['names', 'emails', 'phones'].forEach(field => {
      replacedContent = replacedContent.replace(
        new RegExp(`{{ ${field} }}`, 'g'),
        (contact[field] || []).join(', ')
      );
    });

    [
      'status',
      'primaryName',
      'primaryPhone',
      'primaryEmail',
      'firstName',
      'lastName',
      'middleName',
      'sex',
      'score',
      'position',
      'department',
      'code',
      'country',
      'city',
      'region',
      'industry'
    ].forEach(field => {
      replacedContent = replacedContent.replace(
        new RegExp(`{{ ${field} }}`, 'g'),
        contact[field] || ''
      );
    });

    ['createdAt', 'modifiedAt', 'birthDate'].forEach(field => {
      replacedContent = replacedContent.replace(
        new RegExp(` {{ ${field} }} `, 'g'),
        contact[field] ? contact[field].toLocaleDateString() : ''
      );
    });

    if (replacedContent.includes(`{{ parentCompanyId }}`)) {
      const parent = await getContactDetail(
        subdomain,
        contentType,
        contact.parentCompanyId
      );

      if (parent) {
        replacedContent = replacedContent.replace(
          /{{ parentCompanyId }}/g,
          (parent?.names || []).join(',')
        );
      }
    }
    if (replacedContent.includes(`{{ ownerId }}`)) {
      const owner = await sendCoreMessage({
        subdomain,
        action: 'users.findOne',
        data: {
          _id: contact.ownerId
        },
        isRPC: true,
        defaultValue: {}
      });

      if (owner) {
        if (owner.firstName && owner.lastName) {
          replacedContent = replacedContent.replace(
            /{{ ownerId }}/g,
            `${owner?.firstName} ${owner?.lastName}`
          );
        } else {
          replacedContent = replacedContent.replace(
            /{{ ownerId }}/g,
            owner?.email || ''
          );
        }
      }
    }

    for (const customFieldData of contact.customFieldsData) {
      replacedContent = replacedContent.replace(
        new RegExp(`{{ customFieldsData.${customFieldData.field} }}`, 'g'),
        customFieldData.stringValue
      );
    }

    const fields = (await getFields({ subdomain, contentType })).filter(
      customField => !customField.value.includes('customFieldsData')
    );

    for (const field of fields) {
      const propertyNames = field.value.includes('.')
        ? field.value.split('.')
        : [field.value];
      let propertyValue = contact;

      for (const propertyName in propertyNames) {
        propertyValue = propertyValue[propertyName] || propertyValue;
      }

      replacedContent = replacedContent.replace(
        new RegExp(` {{ ${field.value} }} `, 'g'),
        propertyValue || ''
      );
    }

    return [replacedContent];
  }
};

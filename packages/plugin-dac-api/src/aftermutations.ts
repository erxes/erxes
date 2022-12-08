import { sendFormsMessage } from './../../plugin-inbox-api/src/messageBroker';
import { createCustomer, getCustomer, updateCustomer } from './api/utils';
import { sendCommonMessage } from './messageBroker';

export default {
  'contacts:customer': ['create', 'update', 'remove']
};

export const afterMutationHandlers = async (subdomain, params) => {
  const { type, action } = params;
  const { primaryPhone } = params.object;

  const orchardCustomer = await getCustomer(subdomain, primaryPhone);
  console.log('ORCHARD CUSTOMER', orchardCustomer);

  try {
    if (type === 'contacts:customer') {
      if (action === 'create') {
        if (orchardCustomer) {
          const customFields: any = {};

          const fieldIds = (params.updatedDocument.customFieldsData || []).map(
            d => d.field
          );

          const fields = await sendCommonMessage({
            subdomain: 'os',
            data: {
              query: {
                _id: { $in: fieldIds }
              }
            },
            serviceName: 'forms',
            action: 'fields.find',
            isRPC: true,
            defaultValue: []
          });
          customFields.firstName = params.object.firstName;
          customFields.lastName = params.object.lastName;
          customFields.cellular = params.object.primaryPhone;
          customFields.e_mail = params.object.primaryEmail;

          for (const customFieldData of params.updatedDocument
            .customFieldsData || []) {
            const field = fields.find(f => f._id === customFieldData.field);

            if (field) {
              if (field) {
                customFields[field.code] = customFieldData.value;
              }
            }
          }

          await updateCustomer(subdomain, customFields);
        } else {
          const customFields: any = {};

          const fieldIds = (params.updatedDocument.customFieldsData || []).map(
            d => d.field
          );

          const fields = await sendCommonMessage({
            subdomain: 'os',
            data: {
              query: {
                _id: { $in: fieldIds }
              }
            },
            serviceName: 'forms',
            action: 'fields.find',
            isRPC: true,
            defaultValue: []
          });
          customFields.firstName = params.object.firstName;
          customFields.lastName = params.object.lastName;
          customFields.cellular = params.object.primaryPhone;
          customFields.e_mail = params.object.primaryEmail;

          for (const customFieldData of params.updatedDocument
            .customFieldsData || []) {
            const field = fields.find(f => f._id === customFieldData.field);

            if (field) {
              if (field) {
                customFields[field.code] = customFieldData.value;
              }
            }
          }

          await createCustomer(subdomain, customFields);
        }
      }

      if (action === 'update') {
        if (orchardCustomer) {
          const customFields: any = {};

          const fieldIds = (params.updatedDocument.customFieldsData || []).map(
            d => d.field
          );

          const fields = await sendCommonMessage({
            subdomain: 'os',
            data: {
              query: {
                _id: { $in: fieldIds }
              }
            },
            serviceName: 'forms',
            action: 'fields.find',
            isRPC: true,
            defaultValue: []
          });
          customFields.firstName = params.object.firstName;
          customFields.lastName = params.object.lastName;
          customFields.cellular = params.object.primaryPhone;
          customFields.e_mail = params.object.primaryEmail;

          for (const customFieldData of params.updatedDocument
            .customFieldsData || []) {
            const field = fields.find(f => f._id === customFieldData.field);

            if (field) {
              if (field) {
                customFields[field.code] = customFieldData.value;
              }
            }
          }

          await updateCustomer(subdomain, customFields);
        } else {
          const customFields: any = {};

          const fieldIds = (params.updatedDocument.customFieldsData || []).map(
            d => d.field
          );

          const fields = await sendCommonMessage({
            subdomain: 'os',
            data: {
              query: {
                _id: { $in: fieldIds }
              }
            },
            serviceName: 'forms',
            action: 'fields.find',
            isRPC: true,
            defaultValue: []
          });
          customFields.firstName = params.object.firstName;
          customFields.lastName = params.object.lastName;
          customFields.cellular = params.object.primaryPhone;
          customFields.e_mail = params.object.primaryEmail;

          for (const customFieldData of params.updatedDocument
            .customFieldsData || []) {
            const field = fields.find(f => f._id === customFieldData.field);

            if (field) {
              if (field) {
                customFields[field.code] = customFieldData.value;
              }
            }
          }

          await createCustomer(subdomain, customFields);
        }
      }

      // if (action === 'remove') {
      //   await removeCustomer(subdomain, params);
      //   console.log('remove');
      // }
      return;
    }
  } catch (e) {
    console.log('ERROR', e);
  }
};

import { generateModels } from './connectionResolver';
import { sendFormsMessage } from './messageBroker';

const IMPORT_EXPORT_TYPES = [
  {
    text: 'Team member',
    contentType: 'user',
    icon: 'user-square'
  }
];

export default {
  importExportTypes: IMPORT_EXPORT_TYPES,
  insertImportItems: async ({ subdomain, data }) => {
    console.log(subdomain, data);
  },

  prepareImportDocs: async ({ subdomain, data }) => {
    const { result, contentType, properties } = data;
    const models = await generateModels(subdomain);

    const bulkDoc: any = [];

    // Iterating field values
    for (const fieldValue of result) {
      const doc: any = {};

      let colIndex: number = 0;

      // Iterating through detailed properties
      for (const property of properties) {
        const value = (fieldValue[colIndex] || '').toString();

        switch (property.name) {
          case 'customProperty':
            {
              doc.customFieldsData.push({
                field: property.id,
                value: fieldValue[colIndex]
              });

              doc.customFieldsData = await sendFormsMessage({
                subdomain,
                action: 'fields.prepareCustomFieldsData',
                data: doc.customFieldsData,
                isRPC: true,
                defaultValue: doc.customFieldsData,
                timeout: 60 * 1000 // 1 minute,
              });
            }
            break;

          case 'password':
            {
              doc.password = models.Users.generatePassword(value);
            }
            break;

          case 'customData':
            {
              doc[property.name] = value;
            }
            break;

          case 'score':
            {
              doc.score = isNaN(value) ? 0 : parseInt(value, 10);
            }
            break;

          case 'companiesPrimaryNames':
            {
              doc.companiesPrimaryNames = value.split(',');
            }
            break;

          case 'companiesPrimaryEmails':
            {
              doc.companiesPrimaryEmails = value.split(',');
            }
            break;

          case 'customersPrimaryEmails':
            doc.customersPrimaryEmails = value.split(',');
            break;

          case 'vendorCode':
            doc.vendorCode = value;
            break;

          default:
            {
              doc[property.name] = value;

              if (property.name === 'createdAt' && value) {
                doc.createdAt = new Date(value);
              }

              if (property.name === 'modifiedAt' && value) {
                doc.modifiedAt = new Date(value);
              }

              if (property.name === 'primaryName' && value) {
                doc.names = [value];
              }

              if (property.name === 'primaryEmail' && value) {
                doc.emails = [value];
              }

              if (property.name === 'primaryPhone' && value) {
                doc.phones = [value];
              }

              if (property.name === 'phones' && value) {
                doc.phones = value.split(',');
              }

              if (property.name === 'emails' && value) {
                doc.emails = value.split(',');
              }

              if (property.name === 'names' && value) {
                doc.names = value.split(',');
              }

              if (property.name === 'isComplete') {
                doc.isComplete = Boolean(value);
              }
            }
            break;
        } // end property.type switch

        colIndex++;
      } // end properties for loop

      if (
        (contentType === 'customer' || contentType === 'lead') &&
        !doc.emailValidationStatus
      ) {
        doc.emailValidationStatus = 'unknown';
      }

      if (
        (contentType === 'customer' || contentType === 'lead') &&
        !doc.phoneValidationStatus
      ) {
        doc.phoneValidationStatus = 'unknown';
      }

      // set board item created user

      bulkDoc.push(doc);
    }

    return bulkDoc;
  }
};

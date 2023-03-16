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
    const models = await generateModels(subdomain);

    const { docs } = data;

    try {
      const objects = await models.Users.insertMany(docs);
      return { objects, updated: 0 };
    } catch (e) {
      return { error: e.message };
    }
  },

  prepareImportDocs: async ({ subdomain, data }) => {
    const { result, properties } = data;
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

          case 'departments':
            {
              const departmentTitles = value.split(',');

              const departmentIds = await models.Departments.find({
                title: { $in: departmentTitles }
              }).distinct('_id');

              doc.departmentIds = departmentIds;
            }
            break;

          case 'branches':
            {
              const branchTitles = value.split(',');

              const branchIds = await models.Branches.find({
                title: { $in: branchTitles }
              }).distinct('_id');

              doc.branchIds = branchIds;
            }
            break;

          case 'customData':
            {
              doc[property.name] = value;
            }
            break;

          default:
            {
              doc[property.name] = value;

              if (property.name === 'createdAt' && value) {
                doc.createdAt = new Date(value);
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
        }

        colIndex++;
      }

      bulkDoc.push(doc);
    }

    return bulkDoc;
  }
};

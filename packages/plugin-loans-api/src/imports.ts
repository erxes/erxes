import { generateModels } from './connectionResolver';
import { IContract } from './models/definitions/contracts';

export const IMPORT_EXPORT_TYPES = [
  {
    text: 'Loan Contract',
    contentType: 'contract',
    icon: 'server-alt'
  }
];

export default {
  importExportTypes: IMPORT_EXPORT_TYPES,

  insertImportItems: async ({
    subdomain,
    data
  }: {
    data: { docs: [IContract] };
    subdomain: string;
  }) => {
    const models = await generateModels(subdomain);

    const { docs } = data;

    let updated = 0;
    const objects: any = [];

    try {
      for (const doc of docs) {
        if (doc.number) {
          const contract = await models.Contracts.findOne({ code: doc.number });

          if (contract) {
            await models.Contracts.updateOne(
              { _id: contract._id },
              { $set: { ...doc } }
            );
            updated++;
          } else {
            const insertedProduct = await models.Contracts.create(doc);

            objects.push(insertedProduct);
          }
        } else {
          const insertedProduct = await models.Contracts.create(doc);

          objects.push(insertedProduct);
        }
      }

      return { objects, updated };
    } catch (e) {
      return { error: e.message };
    }
  },

  prepareImportDocs: async ({ subdomain, data }) => {
    const { result, properties } = data;

    const bulkDoc: any = [];

    // Iterating field values
    for (const fieldValue of result) {
      let colIndex: number = 0;

      var res = {};
      for (const property of properties) {
        const value = (fieldValue[colIndex] || '').toString();
        if (property.name === 'classification')
          res[property.name] = value.toUpperCase();
        else res[property.name] = value;

        colIndex++;
      }

      bulkDoc.push(res);
    }

    return bulkDoc;
  }
};

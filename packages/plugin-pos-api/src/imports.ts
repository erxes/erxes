import { generateModels } from './connectionResolver';
const IMPORT_EXPORT_TYPES = [
  {
    text: 'Pos Order',
    contentType: 'pos',
    icon: 'server-alt',
    skipFilter: false
  }
];
export default {
  importExportTypes: IMPORT_EXPORT_TYPES,
  insertImportItems: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { docs } = data;

    let updated = 0;
    const objects: any = [];

    try {
      for (const doc of docs) {
        if (doc.code) {
          const pos_orders = await models.PosOrders.findOne({ code: doc.code });

          if (pos_orders) {
            delete doc.code;
            await models.PosOrders.updateOne(
              { _id: pos_orders._id },
              { $set: { ...doc } }
            );
            updated++;
          } else {
            const insertedPosOrder = await models.PosOrders.create(doc);

            objects.push(insertedPosOrder);
          }
        } else {
          const insertedPosOrder = await models.PosOrders.create(doc);

          objects.push(insertedPosOrder);
        }
      }

      return { objects, updated };
    } catch (e) {
      return { error: e.message };
    }
  },

  prepareImportDocs: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    const { result, properties, contentType, user } = data;

    const bulkDoc: any = [];

    // Iterating field values
    for (const fieldValue of result) {
      const doc: any = {
        customFieldsData: []
      };

      let colIndex: number = 0;

      for (const property of properties) {
        const value = (fieldValue[colIndex] || '').toString();

        switch (property.name) {
          case 'createdAt':
            const createdAt = await models.PosOrders.findOne({
              createdAt: new Date(value)
            });
            doc.createdAt = createdAt ? createdAt.createdAt : new Date(value);
            break;

          case 'status':
            const status = await models.PosOrders.findOne({
              status: value
            });
            doc.status = status ? status.status : value;
            break;

          case 'paidDate':
            const paidDate = await models.PosOrders.findOne({
              paidDate: new Date(value)
            });
            doc.paidDate = paidDate ? paidDate.paidDate : new Date(value);
            break;
          case 'dueDate':
            const dueDate = await models.PosOrders.findOne({
              dueDate: new Date(value)
            });
            doc.dueDate = dueDate ? dueDate.dueDate : new Date(value);
            break;
          case 'totalAmount':
            const totalAmountData = parseFloat(value);

            if (!Array.isArray(doc.totalAmount)) {
              doc.totalAmount = [];
            }
            doc.totalAmount.push(totalAmountData);

            let totalAmountSum = 0;
            for (const data of doc.totalAmount) {
              totalAmountSum += data;
            }
            doc.totalAmount = totalAmountSum;
            break;

          default:
            {
              doc[property.name] = value;

              if (property.name === 'createdAt' && value) {
                doc.createdAt = new Date(value);
              }

              if (property.name === 'paidDate' && value) {
                doc.paidDate = new Date(value);
              }
              if (property.name === 'dueDate' && value) {
                doc.dueDate = new Date(value);
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

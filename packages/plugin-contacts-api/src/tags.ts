import { generateModels } from './connectionResolver';

export default {
  tag: async ({ subdomain, data }) => {
    const { type, action, _ids, tagIds, targetIds } = data;

    const models = await generateModels(subdomain);

    let response = {};
    let model: any = models.Companies;

    if (type === 'customer') {
      model = models.Customers;
    }

    if (action === 'count') {
      response = await model.countDocuments({ tagIds: { $in: _ids } });
    }

    if (action === 'tagObject') {
      await model.updateMany(
        { _id: { $in: targetIds } },
        { $set: { tagIds } },
        { multi: true }
      );

      response = await model.find({ _id: { $in: targetIds } }).lean();
    }

    return response;
  }
};

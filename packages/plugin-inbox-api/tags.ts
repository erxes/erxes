import { generateModels } from "./src/connectionResolver";

export default {
  tag: async args => {
    const { subdomain } = args;
    const models = await generateModels(subdomain)

    let data = {};
    let model: any = models.Conversations

    if(args.type === 'integration') {
      model = models.Integrations
    }

    if (args.action === 'count') {
      data = await model.countDocuments({ tagIds: { $in: args._ids } });
    }

    if (args.action === 'tagObject') {
      await model.updateMany(
        { _id: { $in: args.targetIds } },
        { $set: { tagIds: args.tagIds } },
        { multi: true }
      );

      data = await model.find({ _id: { $in: args.targetIds } }).lean();
    }

    return data;
  }
}
import { IContext } from '~/connectionResolvers';

export default {
  saveWidget: async (_root: any, { widget }: { widget: any }, { models, user }: IContext) => {
    const newWidget = new models.SavedWidget({
      ...widget,
      userId: user._id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await newWidget.save();
    return newWidget;
  },
  updateWidget: async (_root: any, { _id, widget }: { _id: string; widget: any }, { models, user }: IContext) => {
    const existing = await models.SavedWidget.findOne({ _id, userId: user._id });
    if (!existing) throw new Error('Widget not found');
    Object.assign(existing, widget, { updatedAt: new Date() });
    await existing.save();
    return existing;
  },
  deleteWidget: async (_root: any, { _id }: { _id: string }, { models, user }: IContext) => {
    const result = await models.SavedWidget.deleteOne({ _id, userId: user._id });
    return result.deletedCount > 0;
  },
};
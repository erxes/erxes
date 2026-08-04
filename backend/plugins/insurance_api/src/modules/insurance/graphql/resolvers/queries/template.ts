import { IContext } from '~/connectionResolvers';

export const templateQueries = {
  contractTemplates: Object.assign(
    async (_parent: undefined, _args: any, { models }: IContext) => {
      return models.Template.find({}).sort({ createdAt: -1 });
    },
    { wrapperConfig: { skipPermission: true } },
  ),

  contractTemplate: Object.assign(
    async (
      _parent: undefined,
      { id }: { id: string },
      { models }: IContext,
    ) => {
      return models.Template.findById(id);
    },
    { wrapperConfig: { skipPermission: true } },
  ),
};

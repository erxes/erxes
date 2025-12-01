
  import { IContext } from '~/connectionResolvers';

   export const templateQueries = {
    getTemplate: async (_parent: undefined, { _id }, { models }: IContext) => {
      return models.Template.getTemplate(_id);
    },
    
    getTemplates: async (_parent: undefined, { models }: IContext) => {
      return models.Template.getTemplates();
    },
  };

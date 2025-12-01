
  import { IContext } from '~/connectionResolvers';

  export const templateMutations = {
    createTemplate: async (_parent: undefined, { name }, { models }: IContext) => {
      return models.Template.createTemplate({name});
    },

    updateTemplate: async (_parent: undefined, { _id, name }, { models }: IContext) => {
      return models.Template.updateTemplate(_id, {name});
    },

    removeTemplate: async (_parent: undefined, { _id }, { models }: IContext) => {
      return models.Template.removeTemplate(_id);
    },
  };


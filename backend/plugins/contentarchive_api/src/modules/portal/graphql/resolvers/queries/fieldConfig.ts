import { IContext } from '~/connectionResolvers';

const fieldQueries = {
  async clientPortalFieldConfig(
    _root,
    { fieldId }: { fieldId: string },
    { models }: IContext
  ) {
    // return models.FieldConfigs.getConfig(fieldId);
    return [];
  }
};

export default fieldQueries;

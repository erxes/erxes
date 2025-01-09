import { IContext } from '../../../connectionResolver';

const fieldQueries = {
  async clientPortalFieldConfig(
    _root,
    { fieldId }: { fieldId: string },
    { models }: IContext
  ) {
    return models.FieldConfigs.getConfig(fieldId);
  }
};

export default fieldQueries;

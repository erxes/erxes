import { IContext } from '../../../connectionResolver';

const fieldQueries = {
  clientPortalFieldConfig(
    _root,
    { fieldId }: { fieldId: string },
    { models }: IContext
  ) {
    return models.FieldConfigs.getConfig(fieldId);
  }
};

export default fieldQueries;

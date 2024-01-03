// clientPortalFieldConfigsAdd

import { IContext } from '../../../connectionResolver';
import { IFieldConfig } from '../../../models/definitions/fieldConfigs';

const fieldMutations = {
  async clientPortalFieldConfigsEdit(
    _root,
    args: IFieldConfig,
    { models }: IContext
  ) {
    return models.FieldConfigs.createOrUpdate(args);
  }
};

export default fieldMutations;

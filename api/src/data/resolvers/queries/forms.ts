import { Brands, Forms, Integrations } from '../../../db/models';
import { KIND_CHOICES } from '../../../db/models/definitions/constants';
import { checkPermission } from '../../permissions/wrappers';
import { IContext } from '../../types';

const formQueries = {
  /**
   * Forms list
   */
  forms(_root, _args, { commonQuerySelector }: IContext) {
    return Forms.find(commonQuerySelector).sort({ title: 1 });
  },

  /**
   * Get one form
   */
  formDetail(_root, { _id }: { _id: string }) {
    return Forms.findOne({ _id });
  },

  async formsCountByBrands(_root, _args, {}) {
    const counts = {};
    const count = query => {
      return Integrations.findAllIntegrations(query).countDocuments();
    };

    const brands = await Brands.find({});

    for (const brand of brands) {
      counts[brand._id] = await count({
        kind: KIND_CHOICES.LEAD,
        brandId: brand._id
      });
    }

    return counts;
  }
};

checkPermission(formQueries, 'forms', 'showForms', []);

export default formQueries;

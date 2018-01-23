import { Integrations } from '../../db/models';

export default {
  integrations(brand) {
    return Integrations.find({ brandId: brand._id });
  },
};

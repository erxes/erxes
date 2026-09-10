import { BeforeResolversConfig } from 'erxes-api-shared/utils';
import ebarimtResolvers, {
  beforeResolverHandlers as ebarimtBeforeResolverHandlers,
} from '~/modules/ebarimt/beforeResolvers';
import productPlacesResolvers, {
  beforeResolverHandlers as productPlacesBeforeResolverHandlers,
} from '~/modules/productPlaces/beforeResolvers';

export const beforeResolvers: BeforeResolversConfig = {
  resolvers: {
    ...ebarimtResolvers,
    ...productPlacesResolvers,
  },
  handler: async (subdomain, params) => {
    if (productPlacesResolvers.products?.includes(params.resolver)) {
      return productPlacesBeforeResolverHandlers(subdomain, params);
    }

    return ebarimtBeforeResolverHandlers(subdomain, params);
  },
};

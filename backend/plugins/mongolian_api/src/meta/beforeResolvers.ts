import { BeforeResolversConfig } from 'erxes-api-shared/utils';
import ebarimtResolvers, {
  beforeResolverHandlers,
} from '~/modules/ebarimt/beforeResolvers';

export const beforeResolvers: BeforeResolversConfig = {
  resolvers: ebarimtResolvers,
  handler: beforeResolverHandlers,
};

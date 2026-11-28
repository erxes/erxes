import { db } from '@erxes/core-db';
import { scoped } from '~/orpc';
import { decideConsent, describeConsent } from './oauthConsent.service';

export const oauthConsentRouter = {
  get: scoped.oauthConsent.get.handler(({ input }) => describeConsent(db(), input.request)),
  decide: scoped.oauthConsent.decide.handler(({ input }) =>
    decideConsent(db(), input.request, input.allow),
  ),
};

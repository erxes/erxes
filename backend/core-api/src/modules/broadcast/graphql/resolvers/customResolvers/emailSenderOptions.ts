import { IContext } from '~/connectionResolvers';
import { TEmailScope } from '~/utils/email/scope';
import {
  listAuthenticatedDomains,
  listSingleSenders,
  resolveAlignedFrom,
} from '~/utils/email/senders';

export interface IEmailSenderOptionsRoot {
  supportsSenderVerification: boolean;
  _scope?: TEmailScope;
}

export default {
  async senders(
    root: IEmailSenderOptionsRoot,
    _args: undefined,
    { models }: IContext,
  ) {
    if (!root.supportsSenderVerification) {
      return [];
    }

    return await listSingleSenders(models, root._scope);
  },

  async supportsDynamicSender(
    root: IEmailSenderOptionsRoot,
    _args: undefined,
    { models }: IContext,
  ) {
    if (!root.supportsSenderVerification) {
      return true;
    }

    const domains = await listAuthenticatedDomains(models, root._scope);

    return domains.some((domain) => domain.status === 'verified');
  },

  async alignedFrom(
    root: IEmailSenderOptionsRoot,
    _args: undefined,
    { models }: IContext,
  ) {
    return await resolveAlignedFrom(models, root._scope);
  },
};

import { IContext } from '~/connectionResolvers';
import { TEmailScope } from '~/utils/email/scope';
import {
  checkFromDomain,
  listMarkedDomains,
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

    return (await listMarkedDomains(models, root._scope)).length > 0;
  },

  async verifiedDomains(
    root: IEmailSenderOptionsRoot,
    _args: undefined,
    { models }: IContext,
  ) {
    if (!root.supportsSenderVerification) {
      return [];
    }

    return await listMarkedDomains(models, root._scope);
  },

  async alignedFrom(
    root: IEmailSenderOptionsRoot,
    _args: undefined,
    { models }: IContext,
  ) {
    return await resolveAlignedFrom(models, root._scope);
  },

  async fromDomain(
    root: IEmailSenderOptionsRoot,
    _args: undefined,
    { models }: IContext,
  ) {
    return await checkFromDomain(models, root._scope);
  },
};

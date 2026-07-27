import { ISender } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { listProviderSenders } from '~/utils/email/senders';

export interface IEmailSenderOptionsRoot {
  supportsSenderVerification: boolean;
  /** Filled in on first use so the two fields below share one provider call. */
  _senders?: ISender[];
}

/**
 * Both fields need the provider's sender list, which is an outbound HTTP call.
 * The root object lives for one request, so caching on it means asking for both
 * fields still costs a single call.
 */
const getSenders = async (
  root: IEmailSenderOptionsRoot,
  { models }: IContext,
) => {
  if (!root.supportsSenderVerification) {
    return [];
  }

  if (!root._senders) {
    root._senders = await listProviderSenders(models);
  }

  return root._senders;
};

export default {
  async senders(
    root: IEmailSenderOptionsRoot,
    _args: undefined,
    context: IContext,
  ) {
    const senders = await getSenders(root, context);

    return senders.filter((sender) => sender.type === 'single');
  },

  /**
   * A free-form "from" address only works when an authenticated domain covers
   * it. Providers with no sender registry accept whatever the relay allows, so
   * they qualify too.
   */
  async supportsDynamicSender(
    root: IEmailSenderOptionsRoot,
    _args: undefined,
    context: IContext,
  ) {
    if (!root.supportsSenderVerification) {
      return true;
    }

    const senders = await getSenders(root, context);

    return senders.some(
      (sender) => sender.type === 'domain' && sender.status === 'verified',
    );
  },
};

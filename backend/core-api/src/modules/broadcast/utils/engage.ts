import { IEngageMessage } from '@/broadcast/@types';
import { CAMPAIGN_METHODS, CONTENT_TYPES } from '@/broadcast/constants';
import { isSenderAllowed } from '~/utils/email/senders';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { FilterQuery } from 'mongoose';
import { ICustomer } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';
import { customerTargetFilter } from './targeting';

interface ICustomerSelector {
  targetType?: string;
  targetIds?: string[];
}

interface ICheckCustomerParams {
  id?: string;
  targetType?: string;
  targetIds?: string[];
}

export const generateCustomerSelector = ({
  targetType,
  targetIds,
}: ICustomerSelector): FilterQuery<ICustomer> => ({
  ...customerTargetFilter(targetType || '', targetIds || []),
  $or: [{ isSubscribed: 'Yes' }, { isSubscribed: { $exists: false } }],
});

export const checkCustomerExists = async (
  subdomain: string,
  models: IModels,
  params: ICheckCustomerParams,
) => {
  const { id, targetType, targetIds } = params;

  const customersSelector = {
    _id: id,
    state: { $ne: CONTENT_TYPES.VISITOR },
    ...generateCustomerSelector({ targetType, targetIds }),
  };

  return models.Customers.findOne(customersSelector).lean();
};

export const resolveCampaignFromEmail = async (
  models: IModels,
  campaign: Pick<IEngageMessage, 'fromEmail' | 'fromUserId'>,
) => {
  if (campaign.fromEmail) {
    return campaign.fromEmail;
  }

  if (!campaign.fromUserId) {
    return undefined;
  }

  const user = await models.Users.findOne({ _id: campaign.fromUserId }).lean();

  return user?.email;
};

const isEmailAddress = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export const checkCampaignDoc = async (
  models: IModels,
  doc: IEngageMessage,
) => {
  const { method, targetIds = [] } = doc;

  if (!CAMPAIGN_METHODS.ALL.includes(method)) {
    throw new Error(`Unsupported broadcast method: ${method}`);
  }

  if (!targetIds.length) {
    throw new Error('Target ids must be specified');
  }

  if (method === CAMPAIGN_METHODS.EMAIL) {
    const fromEmail = await resolveCampaignFromEmail(models, doc);

    if (!fromEmail) {
      throw new Error('From sender must be specified');
    }

    if (!(await isSenderAllowed(models, fromEmail, 'broadcast'))) {
      throw new Error(`"${fromEmail}" is not a verified sender`);
    }

    const { replyTo } = doc.email || {};

    if (replyTo && !isEmailAddress(replyTo)) {
      throw new Error(`"${replyTo}" is not a valid reply-to address`);
    }
  }

  if (method === CAMPAIGN_METHODS.NOTIFICATION) {
    if (!doc.notification || !doc.title || !doc?.notification.content) {
      throw new Error(
        'Required fields are missing. Please fill in all mandatory fields.',
      );
    }
    if (!doc.cpId) {
      throw new Error(
        'Please select "Clientportal" in the notification campaign',
      );
    }
  }
};

const count = async (
  models: IModels,
  selector: FilterQuery<IEngageMessage>,
): Promise<number> => {
  const res = await models.EngageMessages.find(selector).countDocuments();
  return Number(res);
};

// Tag query builder
const tagQueryBuilder = (tagId: string) => ({ tagIds: tagId });

// status query builder
const statusQueryBuilder = (
  status: string,
  user?: IUserDocument,
):
  | {
      [index: string]: boolean | string;
    }
  | undefined => {
  if (status === 'live') {
    return { isLive: true };
  }

  if (status === 'draft') {
    return { isDraft: true };
  }

  if (status === 'yours' && user) {
    return { fromUserId: user._id };
  }

  // status is 'paused'
  return { isLive: false };
};

export const countsByKind = async (models: IModels) => ({
  all: await count(models, {}),
  auto: await count(models, { kind: 'auto' }),
  visitorAuto: await count(models, { kind: 'visitorAuto' }),
  manual: await count(models, { kind: 'manual' }),
});

// count for each status type
export const countsByStatus = async (
  models: IModels,
  { kind, user }: { kind: string; user },
): Promise<{
  [index: string]: number;
}> => {
  const query: {
    kind?: string;
  } = {};

  if (kind) {
    query.kind = kind;
  }

  return {
    live: await count(models, { ...query, ...statusQueryBuilder('live') }),
    draft: await count(models, { ...query, ...statusQueryBuilder('draft') }),
    paused: await count(models, { ...query, ...statusQueryBuilder('paused') }),
    yours: await count(models, {
      ...query,
      ...statusQueryBuilder('yours', user),
    }),
  };
};

// cout for each tag
export const countsByTag = async (
  models: IModels,
  {
    kind,
    status,
    user,
  }: {
    kind: string;
    status: string;
    user;
  },
): Promise<{
  [index: string]: number;
}> => {
  let query: any = {};

  if (kind) {
    query.kind = kind;
  }

  if (status) {
    query = { ...query, ...statusQueryBuilder(status, user) };
  }

  const tags = await models.Tags.find({ type: 'broadcast:engageMessage' });

  const response: {
    [index: string]: number;
  } = {};

  for (const tag of tags) {
    response[tag._id] = await count(models, {
      ...query,
      ...tagQueryBuilder(tag._id),
    });
  }

  return response;
};

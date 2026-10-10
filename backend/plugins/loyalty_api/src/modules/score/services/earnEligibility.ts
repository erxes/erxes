import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { isInSegment } from '~/utils/utils';
import {
  TLoyaltyEarnEligibility,
  TLoyaltyOwnerType,
} from '@/score/@types/accountType';

export const EARN_ELIGIBILITY = {
  ALL: 'all',
  CLIENT_PORTAL: 'clientPortal',
  SEGMENT: 'segment',
} as const;

const hasClientPortalUser = async (subdomain: string, customerId: string) =>
  !!(await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'cpUsers',
    action: 'get',
    input: { erxesCustomerId: customerId },
    defaultValue: null,
  }));

/** Why a wallet's rule keeps the setting from being saved, or null. */
export const earnEligibilityIssue = (
  eligibility: TLoyaltyEarnEligibility | undefined,
  ownerType: TLoyaltyOwnerType,
) => {
  if (!eligibility || eligibility.who === EARN_ELIGIBILITY.ALL) {
    return null;
  }

  if (eligibility.who === EARN_ELIGIBILITY.CLIENT_PORTAL) {
    return ownerType === 'customer'
      ? null
      : 'Only a customer wallet can require a client portal account';
  }

  if (eligibility.who === EARN_ELIGIBILITY.SEGMENT) {
    return eligibility.segmentId ? null : 'Choose the segment that may earn';
  }

  return `Unknown earn eligibility: ${eligibility.who}`;
};

/**
 * Whether an owner may earn into a wallet. Only earning is gated: what they
 * already hold can still be spent and refunded.
 */
export const mayEarn = async ({
  subdomain,
  eligibility,
  ownerType,
  ownerId,
}: {
  subdomain: string;
  eligibility?: TLoyaltyEarnEligibility | null;
  ownerType: string;
  ownerId: string;
}) => {
  switch (eligibility?.who) {
    case EARN_ELIGIBILITY.CLIENT_PORTAL:
      return (
        ownerType !== 'customer' || hasClientPortalUser(subdomain, ownerId)
      );
    case EARN_ELIGIBILITY.SEGMENT:
      return (
        !!eligibility.segmentId &&
        !!(await isInSegment(subdomain, eligibility.segmentId, ownerId))
      );
    default:
      return true;
  }
};

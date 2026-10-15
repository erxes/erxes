import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { generateAutomationElementId } from 'ui-modules';
import type { LoyaltyBirthdayVoucherCampaignQuery } from '~/gql/graphql';
import {
  BIRTHDAY_AUTO_ISSUE_KIND,
  BIRTHDAY_SEGMENT_ROOT,
  CUSTOMER_CONTENT_TYPE,
  isBirthdaySegmentRoot,
  ISSUE_VOUCHER_ACTION,
  SEGMENT_MEMBERSHIP_EVENT,
} from '../constants/birthdayReward';
import {
  LOYALTY_BIRTHDAY_AUTOMATION_ADD,
  LOYALTY_BIRTHDAY_AUTOMATION_REMOVE,
  LOYALTY_BIRTHDAY_BROADCAST_ADD,
  LOYALTY_BIRTHDAY_BROADCAST_FOLLOW,
  LOYALTY_BIRTHDAY_BROADCAST_REMOVE,
  LOYALTY_BIRTHDAY_REWARD_SET,
  LOYALTY_BIRTHDAY_SEGMENT_ADD,
} from '../graphql/birthdayRewardMutations';
import {
  LOYALTY_BIRTHDAY_SEGMENTS,
  LOYALTY_BIRTHDAY_VOUCHER_CAMPAIGN,
} from '../graphql/birthdayRewardQueries';

type TAutoIssue = NonNullable<
  NonNullable<
    NonNullable<
      LoyaltyBirthdayVoucherCampaignQuery['voucherCampaignDetail']
    >['autoIssue']
  >[number]
>;

export type TBirthdayReward = {
  campaignId: string;
  campaignTitle: string;
  segmentId: string;
  broadcastId?: string;
  automationId?: string;
};

const partId = (parts: TAutoIssue['parts'], engine: string) =>
  parts?.find((part) => part?.engine === engine)?.id ?? undefined;

// Each run acts for one customer: the broadcast's recipient, or the one who
// entered the segment.
const issueVoucherNode = (voucherCampaignId: string) => ({
  ...ISSUE_VOUCHER_ACTION,
  id: generateAutomationElementId(),
  config: { voucherCampaignId, attribution: '{{ trigger._id }}' },
  // Matches the horizontal gap the node library uses.
  position: { x: 500, y: 0 },
});

// The broadcast is the nightly round, the automation the one who turns up
// during the day; they are made, and undone, together.
export const useVoucherBirthdayReward = (campaignId: string) => {
  const { t } = useTranslation('loyalty');
  const client = useApolloClient();
  const [connecting, setConnecting] = useState(false);

  const { data, loading, error } = useQuery(LOYALTY_BIRTHDAY_VOUCHER_CAMPAIGN, {
    variables: { _id: campaignId },
    skip: !campaignId,
    fetchPolicy: 'cache-and-network',
  });
  const campaign = data?.voucherCampaignDetail;
  const entry = campaign?.autoIssue?.find(
    (issue) => issue?.kind === BIRTHDAY_AUTO_ISSUE_KIND,
  );
  const reward: TBirthdayReward | null =
    campaign && entry
      ? {
          campaignId: campaign._id,
          campaignTitle: campaign.title || '',
          segmentId: entry.segmentId ?? '',
          broadcastId: partId(entry.parts, 'broadcast'),
          automationId: partId(entry.parts, 'automation'),
        }
      : null;

  const [addSegment] = useMutation(LOYALTY_BIRTHDAY_SEGMENT_ADD);
  const [addBroadcast] = useMutation(LOYALTY_BIRTHDAY_BROADCAST_ADD);
  const [followSegment] = useMutation(LOYALTY_BIRTHDAY_BROADCAST_FOLLOW);
  const [removeBroadcast] = useMutation(LOYALTY_BIRTHDAY_BROADCAST_REMOVE);
  const [addAutomation] = useMutation(LOYALTY_BIRTHDAY_AUTOMATION_ADD);
  const [removeAutomation] = useMutation(LOYALTY_BIRTHDAY_AUTOMATION_REMOVE);
  const [setReward] = useMutation(LOYALTY_BIRTHDAY_REWARD_SET, {
    refetchQueries: ['LoyaltyBirthdayVoucherCampaign'],
    awaitRefetchQueries: true,
  });

  // One shared "birthday today" segment, whoever made it.
  const ensureSegment = async () => {
    const { data: segmentsData } = await client.query({
      query: LOYALTY_BIRTHDAY_SEGMENTS,
      variables: { contentTypes: [CUSTOMER_CONTENT_TYPE] },
      fetchPolicy: 'network-only',
    });
    const existing = (segmentsData?.segments || []).find((segment) =>
      isBirthdaySegmentRoot(segment?.root),
    );

    if (existing) {
      return existing._id;
    }

    const { data: added } = await addSegment({
      variables: {
        contentType: CUSTOMER_CONTENT_TYPE,
        name: t('birthday-reward-segment-name'),
        root: BIRTHDAY_SEGMENT_ROOT,
        visibility: 'organization',
      },
    });

    const segmentId = added?.segmentsAdd?._id;

    if (!segmentId) {
      throw new Error(t('unexpected-error'));
    }

    return segmentId;
  };

  const connect = async () => {
    if (!campaign) {
      return;
    }

    setConnecting(true);
    const made: { broadcastId?: string; automationId?: string } = {};

    try {
      const segmentId = await ensureSegment();
      const name = t('birthday-reward-name', { campaign: campaign.title });

      const broadcastStep = issueVoucherNode(campaign._id);
      const { data: broadcast } = await addBroadcast({
        variables: {
          title: name,
          targetIds: [segmentId],
          workflow: {
            actions: [broadcastStep],
            entryActionId: broadcastStep.id,
          },
        },
      });
      const broadcastId = broadcast?.engageMessageAdd?._id;

      if (!broadcastId) {
        throw new Error(t('unexpected-error'));
      }

      made.broadcastId = broadcastId;

      await followSegment({
        variables: {
          _id: broadcastId,
          // The zone decides which day a night's refresh belongs to.
          afterSegment: {
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        },
      });

      const automationStep = issueVoucherNode(campaign._id);
      const { data: automation } = await addAutomation({
        variables: {
          name,
          status: 'active',
          triggers: [
            {
              id: generateAutomationElementId(),
              type: CUSTOMER_CONTENT_TYPE,
              label: 'Customer',
              icon: 'IconUsersGroup',
              config: {
                event: SEGMENT_MEMBERSHIP_EVENT,
                segmentId,
                joined: automationStep.id,
              },
              position: { x: 0, y: 0 },
            },
          ],
          actions: [automationStep],
        },
      });
      const automationId = automation?.automationsAdd?._id;

      if (!automationId) {
        throw new Error(t('unexpected-error'));
      }

      made.automationId = automationId;

      await setReward({
        variables: {
          _id: campaign._id,
          kind: BIRTHDAY_AUTO_ISSUE_KIND,
          segmentId,
          parts: [
            { engine: 'broadcast', id: broadcastId },
            { engine: 'automation', id: automationId },
          ],
        },
      });

      toast({ title: t('birthday-reward-connected'), variant: 'success' });
    } catch (connectError) {
      // Half a bundle would hand out on one road only, so nothing is kept.
      await Promise.allSettled([
        made.broadcastId &&
          removeBroadcast({ variables: { _ids: [made.broadcastId] } }),
        made.automationId &&
          removeAutomation({
            variables: { automationIds: [made.automationId] },
          }),
      ]);
      toast({
        title: t('error'),
        description:
          connectError instanceof Error
            ? connectError.message
            : String(connectError),
        variant: 'destructive',
      });
    } finally {
      setConnecting(false);
    }
  };

  return {
    reward,
    loading,
    error,
    connecting,
    connect,
    // Both roads may reach the same person on one day; the limit keeps it one.
    unlimited: !!campaign && !campaign.perOwnerLimit,
  };
};

import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { generateAutomationElementId, SEGMENT_ADD } from 'ui-modules';
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
} from '../graphql/birthdayRewardMutations';
import {
  LOYALTY_BIRTHDAY_SEGMENTS,
  LOYALTY_BIRTHDAY_VOUCHER_CAMPAIGN,
} from '../graphql/birthdayRewardQueries';

type TAutoIssuePart = { engine: string; id: string };

type TVoucherCampaign = {
  _id: string;
  title?: string;
  perOwnerLimit?: { count: number; period: string } | null;
  autoIssue?: { kind: string; segmentId: string; parts?: TAutoIssuePart[] }[];
};

type TSegment = { _id: string; root?: Record<string, unknown> };

export type TBirthdayReward = {
  campaignId: string;
  campaignTitle: string;
  segmentId: string;
  broadcastId?: string;
  automationId?: string;
};

const partId = (parts: TAutoIssuePart[] = [], engine: string) =>
  parts.find((part) => part.engine === engine)?.id;

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

  const { data, loading, error } = useQuery<{
    voucherCampaignDetail?: TVoucherCampaign;
  }>(LOYALTY_BIRTHDAY_VOUCHER_CAMPAIGN, {
    variables: { _id: campaignId },
    skip: !campaignId,
    fetchPolicy: 'cache-and-network',
  });
  const campaign = data?.voucherCampaignDetail;
  const entry = campaign?.autoIssue?.find(
    ({ kind }) => kind === BIRTHDAY_AUTO_ISSUE_KIND,
  );
  const reward: TBirthdayReward | null =
    campaign && entry
      ? {
          campaignId: campaign._id,
          campaignTitle: campaign.title || '',
          segmentId: entry.segmentId,
          broadcastId: partId(entry.parts, 'broadcast'),
          automationId: partId(entry.parts, 'automation'),
        }
      : null;

  const [addSegment] = useMutation(SEGMENT_ADD);
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
    const { data: segmentsData } = await client.query<{
      segments?: TSegment[];
    }>({
      query: LOYALTY_BIRTHDAY_SEGMENTS,
      variables: { contentTypes: [CUSTOMER_CONTENT_TYPE] },
      fetchPolicy: 'network-only',
    });
    const existing = (segmentsData?.segments || []).find(({ root }) =>
      isBirthdaySegmentRoot(root),
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

    return added?.segmentsAdd?._id as string;
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
      made.broadcastId = broadcast?.engageMessageAdd?._id;

      await followSegment({
        variables: {
          _id: made.broadcastId,
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
      made.automationId = automation?.automationsAdd?._id;

      await setReward({
        variables: {
          _id: campaign._id,
          kind: BIRTHDAY_AUTO_ISSUE_KIND,
          segmentId,
          parts: [
            { engine: 'broadcast', id: made.broadcastId },
            { engine: 'automation', id: made.automationId },
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

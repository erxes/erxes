import { useMutation, useQuery } from '@apollo/client';
import { toast, useConfirm } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BIRTHDAY_AUTO_ISSUE_KIND } from '../constants/birthdayReward';
import {
  LOYALTY_BIRTHDAY_AUTOMATION_REMOVE,
  LOYALTY_BIRTHDAY_AUTOMATION_SET_STATUS,
  LOYALTY_BIRTHDAY_BROADCAST_FOLLOW,
  LOYALTY_BIRTHDAY_BROADCAST_REMOVE,
  LOYALTY_BIRTHDAY_BROADCAST_UNFOLLOW,
  LOYALTY_BIRTHDAY_REWARD_REMOVE,
} from '../graphql/birthdayRewardMutations';
import {
  LOYALTY_BIRTHDAY_AUTOMATION,
  LOYALTY_BIRTHDAY_BROADCAST,
} from '../graphql/birthdayRewardQueries';
import { TBirthdayReward } from './useVoucherBirthdayReward';

type TBroadcast = {
  _id: string;
  nextRunAt?: string;
  lastRunAt?: string;
  scheduleDate?: { type?: string } | null;
};

/** The two halves of one reward, read and switched as one. */
export const useBirthdayRewardParts = ({
  campaignId,
  campaignTitle,
  broadcastId,
  automationId,
}: TBirthdayReward) => {
  const { t } = useTranslation('loyalty');
  const { confirm } = useConfirm();
  const [busy, setBusy] = useState(false);

  const broadcastQuery = useQuery<{ engageMessageDetail?: TBroadcast | null }>(
    LOYALTY_BIRTHDAY_BROADCAST,
    {
      variables: { _id: broadcastId },
      skip: !broadcastId,
      fetchPolicy: 'cache-and-network',
    },
  );
  const automationQuery = useQuery<{
    automationDetail?: { _id: string; status?: string } | null;
  }>(LOYALTY_BIRTHDAY_AUTOMATION, {
    variables: { _id: automationId },
    skip: !automationId,
    fetchPolicy: 'cache-and-network',
  });

  const [follow] = useMutation(LOYALTY_BIRTHDAY_BROADCAST_FOLLOW);
  const [unfollow] = useMutation(LOYALTY_BIRTHDAY_BROADCAST_UNFOLLOW);
  const [setAutomationStatus] = useMutation(
    LOYALTY_BIRTHDAY_AUTOMATION_SET_STATUS,
  );
  const [removeBroadcast] = useMutation(LOYALTY_BIRTHDAY_BROADCAST_REMOVE);
  const [removeAutomation] = useMutation(LOYALTY_BIRTHDAY_AUTOMATION_REMOVE);
  const [removeReward] = useMutation(LOYALTY_BIRTHDAY_REWARD_REMOVE, {
    refetchQueries: ['LoyaltyBirthdayVoucherCampaign'],
    awaitRefetchQueries: true,
  });

  const broadcast = broadcastQuery.data?.engageMessageDetail;
  const automation = automationQuery.data?.automationDetail;
  const loading = broadcastQuery.loading || automationQuery.loading;

  const nightlyOn = broadcast?.scheduleDate?.type === 'afterSegment';
  const daytimeOn = automation?.status === 'active';
  // A half deleted elsewhere leaves the bundle unable to do its job.
  const broken =
    !loading && (!broadcast || !automation || nightlyOn !== daytimeOn);

  const fail = (error: unknown) =>
    toast({
      title: t('error'),
      description: error instanceof Error ? error.message : String(error),
      variant: 'destructive',
    });

  const toggle = async (on: boolean) => {
    if (!broadcast || !automation) {
      return;
    }

    setBusy(true);

    try {
      if (on && !nightlyOn) {
        await follow({
          variables: {
            _id: broadcast._id,
            afterSegment: {
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
          },
        });
      }

      if (!on && nightlyOn) {
        await unfollow({ variables: { _id: broadcast._id } });
      }

      if (on !== daytimeOn) {
        await setAutomationStatus({
          variables: { _id: automation._id, status: on ? 'active' : 'draft' },
        });
      }

      toast({
        title: on
          ? t('loyalty-source-turned-on')
          : t('loyalty-source-turned-off'),
        variant: 'success',
      });
    } catch (error) {
      fail(error);
    } finally {
      setBusy(false);
    }
  };

  const disconnect = () =>
    confirm({
      message: t('birthday-reward-disconnect-confirm', {
        campaign: campaignTitle,
      }),
    }).then(async () => {
      setBusy(true);

      try {
        // Either may already be gone; the record of the bundle goes regardless.
        await Promise.allSettled([
          broadcastId &&
            removeBroadcast({ variables: { _ids: [broadcastId] } }),
          automationId &&
            removeAutomation({ variables: { automationIds: [automationId] } }),
        ]);
        await removeReward({
          variables: { _id: campaignId, kind: BIRTHDAY_AUTO_ISSUE_KIND },
        });
        toast({ title: t('deleted', 'Deleted'), variant: 'success' });
      } catch (error) {
        fail(error);
      } finally {
        setBusy(false);
      }
    });

  return {
    loading,
    busy,
    on: nightlyOn && daytimeOn,
    broken,
    canToggle: !!broadcast && !!automation,
    nextRunAt: broadcast?.nextRunAt,
    lastRunAt: broadcast?.lastRunAt,
    automationPath: automation ? `/automations/edit/${automation._id}` : '',
    broadcastPath: broadcast ? `/broadcasts?messageId=${broadcast._id}` : '',
    toggle,
    disconnect,
  };
};

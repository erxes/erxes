import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { currentUserState } from 'ui-modules';
import { MemberActivityTime } from '@/settings/team-member/activity/components/MemberActivityTime';
import { useMemberActivity } from '@/settings/team-member/activity/hooks/useMemberActivity';

/** Members see what is recorded about them; hidden while tracking is off. */
export const ProfileActivity = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const currentUser = useAtomValue(currentUserState);
  const userId = currentUser?._id || '';
  const { enabled } = useMemberActivity(userId);

  if (!userId || !enabled) {
    return null;
  }

  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-base font-semibold">{t('my-active-time')}</h3>
      <div className="rounded-lg border [&>div]:p-4">
        <MemberActivityTime userId={userId} />
      </div>
    </section>
  );
};

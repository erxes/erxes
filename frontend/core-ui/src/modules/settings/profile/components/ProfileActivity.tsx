import { useAtomValue } from 'jotai';
import { currentUserState } from 'ui-modules';
import { MemberActivityTime } from '@/settings/team-member/activity/components/MemberActivityTime';

/** Members see what is recorded about them; MemberActivityTime owns the tracking-off state. */
export const ProfileActivity = () => {
  const currentUser = useAtomValue(currentUserState);

  if (!currentUser?._id) {
    return null;
  }

  return (
    <div className="rounded-lg border [&>div]:p-4">
      <MemberActivityTime userId={currentUser._id} />
    </div>
  );
};

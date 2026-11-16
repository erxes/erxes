import { type MemberQueries, memberName, useMembersById } from '../pickers/members';
import { RecordChip } from './RecordChip';

/** The content type core's side panel opens team members as. */
export const MEMBER_CONTENT_TYPE = 'core:user';

/**
 * A team member as a chip: their avatar and name. Inside erxes, clicking it opens the member in
 * core's side panel beside the page (their detail and what they did); elsewhere it is only
 * the name. `members` is `memberQueries` from `@erxes/core-contract/client`.
 */
export const MemberLink = ({ memberId, members }: { memberId: string; members: MemberQueries }) => {
  const member = useMembersById([memberId], members).get(memberId);

  return (
    <RecordChip
      record={{ contentType: MEMBER_CONTENT_TYPE, contentId: memberId }}
      name={member ? memberName(member) : ''}
      avatarUrl={member?.avatarUrl}
      loading={!member}
      failed={false}
    />
  );
};

import { useUserObjectEdit } from '@/settings/team-member/hooks/useUserEdit';
import type { IUserDetail } from '@/settings/team-member/types';
import { PanelAvatarPopover } from '@/side-panel/components/details/PanelAvatarField';
import type { ReactNode } from 'react';

/** Uses the customer avatar editor while preserving the member's other details. */
export const MemberPanelAvatar = ({
  user,
  children,
}: {
  user: IUserDetail;
  children: ReactNode;
}) => {
  const editDetails = useUserObjectEdit(user._id, 'details', user.details);
  return (
    <PanelAvatarPopover
      value={user.details?.avatar || ''}
      onSave={(avatar) => editDetails({ avatar })}
    >
      {children}
    </PanelAvatarPopover>
  );
};

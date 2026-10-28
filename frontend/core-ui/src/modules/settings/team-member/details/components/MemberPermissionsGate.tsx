import { useAtomValue } from 'jotai';
import { ReactNode } from 'react';
import { Can, currentUserState } from 'ui-modules';
import { useUserDetail } from '@/settings/team-member/hooks/useUserDetail';

export const MemberPermissionsGate = ({
  children,
}: {
  children: ReactNode;
}) => {
  const currentUser = useAtomValue(currentUserState);
  const { userDetail } = useUserDetail();
  const isOwnDetail = !!userDetail && currentUser?._id === userDetail._id;

  return (
    <Can
      action="permissionsManage"
      fallback={
        <Can
          action="structureEntitiesManage"
          fallback={isOwnDetail ? children : null}
        >
          {children}
        </Can>
      }
    >
      {children}
    </Can>
  );
};

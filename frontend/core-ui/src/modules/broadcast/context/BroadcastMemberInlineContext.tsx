import { AvatarProps, isUndefinedOrNull, Tooltip } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { createContext, useContext, useEffect, useState } from 'react';
import { IUser, useMemberInline } from 'ui-modules';
import { currentUserState } from 'ui-modules/states';

export interface IBroadcastMemberInlineContext {
  members: IUser[];
  loading: boolean;
  memberIds?: string[];
  placeholder: string;
  size?: AvatarProps['size'];
  updateMembers?: (members: IUser[]) => void;
}

export const BroadcastMemberInlineContext =
  createContext<IBroadcastMemberInlineContext | null>(null);

export const useBroadcastMemberInlineContext = () => {
  const context = useContext(BroadcastMemberInlineContext);
  if (!context) {
    throw new Error(
      'useBroadcastMemberInlineContext must be used within a BroadcastMemberInlineProvider',
    );
  }
  return context;
};

export const BroadcastMemberInlineProvider = ({
  children,
  memberIds,
  members,
  placeholder,
  updateMembers,
  size,
}: {
  children?: React.ReactNode;
  memberIds?: string[];
  members?: IUser[];
  placeholder?: string;
  updateMembers?: (members: IUser[]) => void;
  size?: AvatarProps['size'];
}) => {
  const [_members, _setMembers] = useState<IUser[]>(members || []);

  return (
    <BroadcastMemberInlineContext.Provider
      value={{
        members: members || _members,
        loading: false,
        memberIds: memberIds || [],
        placeholder: isUndefinedOrNull(placeholder)
          ? 'Select members'
          : placeholder,
        updateMembers: updateMembers || _setMembers,
        size,
      }}
    >
      <Tooltip.Provider>{children}</Tooltip.Provider>
      {memberIds
        ?.filter((id) => !members?.some((member) => member._id === id))
        .map((memberId) => (
          <MemberInlineEffectComponent key={memberId} memberId={memberId} />
        ))}
    </BroadcastMemberInlineContext.Provider>
  );
};

const MemberInlineEffectComponent = ({ memberId }: { memberId: string }) => {
  const currentUser = useAtomValue(currentUserState) as IUser;
  const { members, memberIds, updateMembers } =
    useBroadcastMemberInlineContext();
  const { userDetail } = useMemberInline({
    variables: {
      _id: memberId,
    },
    skip: !memberId || memberId === currentUser._id,
  });

  useEffect(() => {
    const newMembers = [...members].filter(
      (m) => memberIds?.includes(m._id) && m._id !== memberId,
    );
    if (newMembers.some((m) => m._id === memberId)) {
      updateMembers?.(newMembers);
      return;
    }
    if (userDetail) {
      updateMembers?.([...newMembers, { ...userDetail, _id: memberId }]);
    }
    if (currentUser._id === memberId) {
      updateMembers?.([currentUser, ...newMembers]);
    }
  }, [userDetail, currentUser]);

  return null;
};

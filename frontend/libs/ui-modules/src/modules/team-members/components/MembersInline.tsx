import { useSubscription } from '@apollo/client';
import { IconUserCancel } from '@tabler/icons-react';
import {
  Avatar,
  AvatarProps,
  Combobox,
  Tooltip,
  cn,
  isUndefinedOrNull,
  readImage,
} from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useCallback, useEffect, useState } from 'react';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { currentUserState } from 'ui-modules/states';

import {
  MembersInlineContext,
  useMembersInlineContext,
} from 'ui-modules/modules/team-members/contexts/MembersInlineContext';
import { USER_STATUS_CHANGED } from 'ui-modules/modules/team-members/graphql/subscriptions/userStatusChanged';
import { useMemberInline } from 'ui-modules/modules/team-members/hooks';
import { IUser } from 'ui-modules/modules/team-members/types/TeamMembers';

export const MembersInlineRoot = ({
  members,
  memberIds,
  placeholder,
  updateMembers,
  className,
  size = 'lg',
  allowUnassigned,
}: {
  members?: IUser[];
  memberIds?: string[];
  placeholder?: string;
  updateMembers?: Dispatch<SetStateAction<IUser[]>>;
  className?: string;
  size?: AvatarProps['size'];
  allowUnassigned?: boolean;
}) => {
  return (
    <MembersInlineProvider
      members={members}
      memberIds={memberIds}
      placeholder={placeholder}
      updateMembers={updateMembers}
      size={size}
      allowUnassigned={allowUnassigned}
    >
      <MembersInlineAvatar size={size} />
      <MembersInlineTitle className={className} />
    </MembersInlineProvider>
  );
};

export const MembersInlineProvider = ({
  children,
  memberIds,
  members,
  placeholder,
  updateMembers,
  size,
  allowUnassigned,
}: {
  children?: ReactNode;
  memberIds?: string[];
  members?: IUser[];
  placeholder?: string;
  updateMembers?: Dispatch<SetStateAction<IUser[]>>;
  size?: AvatarProps['size'];
  allowUnassigned?: boolean;
}) => {
  const [_members, _setMembers] = useState<IUser[]>(members || []);
  const [inactiveMemberIds, setInactiveMemberIds] = useState<string[]>([]);
  const currentMembers = members || _members;
  const activeMembers = currentMembers.filter(
    ({ _id, isActive }) =>
      isActive !== false && !inactiveMemberIds.includes(_id),
  );
  const handleMemberActiveChange = useCallback(
    (memberId: string, isActive: boolean) => {
      setInactiveMemberIds((currentIds) => {
        if (isActive) {
          return currentIds.includes(memberId)
            ? currentIds.filter((id) => id !== memberId)
            : currentIds;
        }

        return currentIds.includes(memberId)
          ? currentIds
          : [...currentIds, memberId];
      });
    },
    [],
  );

  return (
    <MembersInlineContext.Provider
      value={{
        members: activeMembers,
        loading: false,
        memberIds: memberIds,
        placeholder: isUndefinedOrNull(placeholder)
          ? 'Select members'
          : placeholder,
        updateMembers: updateMembers || _setMembers,
        size,
        allowUnassigned,
      }}
    >
      <Tooltip.Provider>{children}</Tooltip.Provider>
      {memberIds?.map((memberId) => (
        <MemberInlineEffectComponent
          key={memberId}
          memberId={memberId}
          onActiveChange={handleMemberActiveChange}
        />
      ))}
    </MembersInlineContext.Provider>
  );
};

const MemberInlineEffectComponent = ({
  memberId,
  onActiveChange,
}: {
  memberId: string;
  onActiveChange: (memberId: string, isActive: boolean) => void;
}) => {
  const currentUser = useAtomValue(currentUserState) as IUser;
  const { updateMembers } = useMembersInlineContext();
  const skip = !memberId || memberId === currentUser?._id;
  const { userDetail } = useMemberInline({
    variables: {
      _id: memberId,
    },
    skip,
    fetchPolicy: 'cache-and-network',
  });
  const { data: statusChangedData } = useSubscription<{
    userStatusChanged?: IUser;
  }>(USER_STATUS_CHANGED, {
    variables: { _id: memberId },
    skip,
  });
  const statusChangedUser = statusChangedData?.userStatusChanged;
  const resolvedUser =
    statusChangedUser?._id === memberId ? statusChangedUser : userDetail;

  useEffect(() => {
    if (!updateMembers) return;

    if (resolvedUser?.isActive === false) {
      onActiveChange(memberId, false);
      updateMembers((prev) => prev.filter(({ _id }) => _id !== memberId));
    } else if (resolvedUser) {
      onActiveChange(memberId, true);
      updateMembers((prev) => {
        if (prev.some((m) => m._id === memberId)) return prev;
        return [...prev, { ...resolvedUser, _id: memberId }];
      });
    }
    if (currentUser?._id === memberId) {
      onActiveChange(memberId, true);
      updateMembers((prev) => {
        if (prev.some((m) => m._id === memberId)) return prev;
        return [currentUser, ...prev];
      });
    }
  }, [resolvedUser, currentUser, memberId, onActiveChange, updateMembers]);

  return null;
};

export const MembersInlineAvatar = ({
  className,
  containerClassName,
  ...props
}: AvatarProps & {
  containerClassName?: string;
}) => {
  const { members, loading, memberIds, size, allowUnassigned } =
    useMembersInlineContext();
  const currentUser = useAtomValue(currentUserState) as IUser;

  const activeMembers = memberIds
    ? members.filter((m) => memberIds.includes(m._id))
    : members;

  const sortedMembers = [...activeMembers].sort((a, b) => {
    if (a._id === currentUser?._id) return -1;
    if (b._id === currentUser?._id) return 1;
    return 0;
  });

  if (loading)
    return (
      <div className={cn('flex -space-x-1.5', containerClassName)}>
        {memberIds?.map((memberId) => (
          <Avatar key={memberId} className={cn('bg-background', className)}>
            <Avatar.Fallback />
          </Avatar>
        ))}
      </div>
    );

  const renderAvatar = (member: IUser) => {
    const { details } = member;
    const { avatar, fullName } = details || {};

    return (
      <Tooltip delayDuration={100} key={member._id}>
        <Tooltip.Trigger asChild>
          <Avatar
            className={cn(
              'bg-background',
              activeMembers.length > 1 && 'ring-2 ring-background',
              className,
            )}
            size={size || 'lg'}
            {...props}
          >
            <Avatar.Image src={readImage(avatar as string, 200)} />
            <Avatar.Fallback>{fullName?.charAt(0) || ''}</Avatar.Fallback>
          </Avatar>
        </Tooltip.Trigger>
        <Tooltip.Content>
          <p>{fullName}</p>
        </Tooltip.Content>
      </Tooltip>
    );
  };

  if (activeMembers.length === 0) {
    if (allowUnassigned) {
      return (
        <IconUserCancel className="text-muted-foreground flex-none size-4" />
      );
    }
    return null;
  }

  if (activeMembers.length === 1) return renderAvatar(activeMembers[0]);

  const withAvatar = sortedMembers.slice(0, sortedMembers.length > 3 ? 2 : 3);
  const restMembers = sortedMembers.slice(withAvatar.length);

  return (
    <div className="flex -space-x-1.5">
      {withAvatar.map((member) => renderAvatar(member))}
      {restMembers.length > 0 && (
        <Tooltip>
          <Tooltip.Trigger asChild>
            <Avatar
              className={cn('ring-2 ring-background bg-background', className)}
              size={size || 'lg'}
              {...props}
            >
              <Avatar.Fallback className="bg-primary/10 text-primary">
                +{restMembers.length}
              </Avatar.Fallback>
            </Avatar>
          </Tooltip.Trigger>
          <Tooltip.Content>
            <p>{restMembers.map((m) => m.details?.fullName).join(', ')}</p>
          </Tooltip.Content>
        </Tooltip>
      )}
    </div>
  );
};

export const MembersInlineTitle = ({ className }: { className?: string }) => {
  const {
    members: allMembers,
    loading,
    placeholder,
    allowUnassigned,
    memberIds,
  } = useMembersInlineContext();
  const currentUser = useAtomValue(currentUserState) as IUser;

  const activeMembers = memberIds?.length
    ? allMembers.filter((m) => memberIds.includes(m._id))
    : allMembers;
  const isCurrentUser = activeMembers.some((m) => m._id === currentUser?._id);

  const getDisplayValue = () => {
    if (!activeMembers || activeMembers.length === 0) {
      if (allowUnassigned) {
        return (
          <span className="capitalize text-muted-foreground/80">
            No assignee
          </span>
        );
      }
      return undefined;
    }

    if (activeMembers.length === 1) {
      return activeMembers?.[0].details?.fullName;
    }

    if (isCurrentUser) {
      const otherMembersCount = activeMembers.length - 1;
      if (otherMembersCount > 1) {
        return `You and ${otherMembersCount} others`;
      }

      const otherMember = activeMembers.find((m) => m._id !== currentUser?._id);
      return `You and ${otherMember?.details?.fullName}`;
    }

    return `${activeMembers.length} members`;
  };

  return (
    <Combobox.Value
      value={getDisplayValue()}
      loading={loading}
      placeholder={placeholder}
      className={className}
    />
  );
};

export const MembersInline = Object.assign(MembersInlineRoot, {
  Provider: MembersInlineProvider,
  Avatar: MembersInlineAvatar,
  Title: MembersInlineTitle,
});

import { useSubscription } from '@apollo/client';
import { IconUserCancel } from '@tabler/icons-react';
import {
  Avatar,
  AvatarProps,
  Badge,
  Combobox,
  Tooltip,
  cn,
  isUndefinedOrNull,
  readImage,
} from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { Fragment, useCallback, useEffect, useState } from 'react';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { currentUserState } from 'ui-modules/states';

import {
  MembersInlineContext,
  useMembersInlineContext,
} from 'ui-modules/modules/team-members/contexts/MembersInlineContext';
import { USER_STATUS_CHANGED } from 'ui-modules/modules/team-members/graphql/subscriptions/userStatusChanged';
import { useMemberInline } from 'ui-modules/modules/team-members/hooks';
import { IUser } from 'ui-modules/modules/team-members/types/TeamMembers';

const getMemberLabel = (member: IUser, showInactive?: boolean) => {
  if (!showInactive) return member.details?.fullName;

  const name =
    member.details?.fullName ||
    member.username ||
    member.email ||
    'Unknown member';
  if (member.isActive !== false) return name;

  return (
    <span className="inline-flex items-center gap-1">
      <span>{name}</span>
      <Badge variant="destructive" className="h-5 px-1.5 text-[11px] shrink-0">
        Inactive
      </Badge>
    </span>
  );
};

export const MembersInlineRoot = ({
  members,
  memberIds,
  placeholder,
  updateMembers,
  className,
  size = 'lg',
  allowUnassigned,
  showInactive,
}: {
  members?: IUser[];
  memberIds?: string[];
  placeholder?: string;
  updateMembers?: Dispatch<SetStateAction<IUser[]>>;
  className?: string;
  size?: AvatarProps['size'];
  allowUnassigned?: boolean;
  showInactive?: boolean;
}) => {
  return (
    <MembersInlineProvider
      members={members}
      memberIds={memberIds}
      placeholder={placeholder}
      updateMembers={updateMembers}
      size={size}
      allowUnassigned={allowUnassigned}
      showInactive={showInactive}
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
  showInactive = false,
}: {
  children?: ReactNode;
  memberIds?: string[];
  members?: IUser[];
  placeholder?: string;
  updateMembers?: Dispatch<SetStateAction<IUser[]>>;
  size?: AvatarProps['size'];
  allowUnassigned?: boolean;
  showInactive?: boolean;
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
        members: showInactive ? currentMembers : activeMembers,
        loading: false,
        memberIds: memberIds,
        placeholder: isUndefinedOrNull(placeholder)
          ? 'Select members'
          : placeholder,
        updateMembers: updateMembers || _setMembers,
        size,
        allowUnassigned,
        showInactive,
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
  const { updateMembers, showInactive } = useMembersInlineContext();
  const skip =
    !memberId || memberId === 'no-assignee' || memberId === currentUser?._id;
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
    if (!updateMembers || !memberId || memberId === 'no-assignee') return;

    if (resolvedUser?._id === memberId) {
      const isActive = resolvedUser.isActive !== false;
      onActiveChange(memberId, isActive);
      updateMembers((prev) => {
        const existing = prev.find(({ _id }) => _id === memberId);
        if (!isActive && !showInactive) {
          return existing ? prev.filter(({ _id }) => _id !== memberId) : prev;
        }
        if (existing === resolvedUser || (existing && !showInactive))
          return prev;
        return [...prev.filter(({ _id }) => _id !== memberId), resolvedUser];
      });
    }
    if (currentUser?._id === memberId) {
      onActiveChange(memberId, true);
      updateMembers((prev) => {
        if (prev.some((m) => m._id === memberId)) return prev;
        return [currentUser, ...prev];
      });
    }
  }, [
    resolvedUser,
    currentUser,
    memberId,
    onActiveChange,
    showInactive,
    updateMembers,
  ]);

  return null;
};

export const MembersInlineAvatar = ({
  className,
  containerClassName,
  ...props
}: AvatarProps & {
  containerClassName?: string;
}) => {
  const { members, loading, memberIds, size, allowUnassigned, showInactive } =
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
          {getMemberLabel(member, showInactive)}
        </Tooltip.Content>
      </Tooltip>
    );
  };

  if (activeMembers.length === 0) {
    if (showInactive && memberIds?.some((id) => id && id !== 'no-assignee')) {
      return (
        <Tooltip>
          <Tooltip.Trigger asChild>
            <Avatar size={size || 'lg'} className={className} {...props}>
              <Avatar.Fallback>?</Avatar.Fallback>
            </Avatar>
          </Tooltip.Trigger>
          <Tooltip.Content>Unknown member</Tooltip.Content>
        </Tooltip>
      );
    }
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
            {restMembers.map((member, index) => (
              <Fragment key={member._id}>
                {index > 0 && ', '}
                {getMemberLabel(member, showInactive)}
              </Fragment>
            ))}
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
    showInactive,
  } = useMembersInlineContext();
  const currentUser = useAtomValue(currentUserState) as IUser;

  const activeMembers = memberIds
    ? allMembers.filter((m) => memberIds.includes(m._id))
    : allMembers;
  const isCurrentUser = activeMembers.some((m) => m._id === currentUser?._id);

  const getDisplayValue = () => {
    if (!activeMembers || activeMembers.length === 0) {
      if (showInactive && memberIds?.some((id) => id && id !== 'no-assignee')) {
        return 'Unknown member';
      }
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
      return getMemberLabel(activeMembers[0], showInactive);
    }

    if (isCurrentUser) {
      const otherMembersCount = activeMembers.length - 1;
      if (otherMembersCount > 1) {
        return `You and ${otherMembersCount} others`;
      }

      const otherMember = activeMembers.find((m) => m._id !== currentUser._id);
      return (
        <>You and {otherMember && getMemberLabel(otherMember, showInactive)}</>
      );
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

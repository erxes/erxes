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
import { useEffect, useState } from 'react';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
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
  const currentMembers = members || _members;

  return (
    <MembersInlineContext.Provider
      value={{
        members: currentMembers,
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
        <MemberInlineEffectComponent key={memberId} memberId={memberId} />
      ))}
    </MembersInlineContext.Provider>
  );
};

const MemberInlineEffectComponent = ({ memberId }: { memberId: string }) => {
  const currentUser = useAtomValue(currentUserState) as IUser;
  const { updateMembers } = useMembersInlineContext();
  const skip = !memberId || memberId === currentUser?._id;
  const { userDetail, loading: memberLoading } = useMemberInline({
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
    if (!updateMembers || skip) return;

    const upsert = (member: IUser) =>
      updateMembers((prev) => {
        const existingIndex = prev.findIndex((m) => m._id === memberId);
        if (existingIndex === -1) return [...prev, member];
        if (
          prev[existingIndex].isActive === member.isActive &&
          prev[existingIndex].isDeleted === member.isDeleted &&
          prev[existingIndex].details?.fullName === member.details?.fullName
        ) {
          return prev;
        }
        const next = [...prev];
        next[existingIndex] = member;
        return next;
      });

    if (resolvedUser) {
      upsert({ ...resolvedUser, _id: memberId });
    } else if (!memberLoading) {
      // Query resolved with no matching user: the member was deleted.
      upsert({ _id: memberId, isActive: false, isDeleted: true } as IUser);
    }
  }, [resolvedUser, memberLoading, memberId, updateMembers, skip]);

  useEffect(() => {
    if (!updateMembers || currentUser?._id !== memberId) return;

    updateMembers((prev) => {
      if (prev.some((m) => m._id === memberId)) return prev;
      return [currentUser, ...prev];
    });
  }, [currentUser, memberId, updateMembers]);

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

  const { t } = useTranslation('team-member');

  const valueMembers = memberIds
    ? members.filter((m) => memberIds.includes(m._id))
    : members;

  const sortedMembers = [...valueMembers].sort((a, b) => {
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

  const getMemberLabel = (member: IUser) => {
    if (member.isDeleted) {
      return t('deleted-user', { defaultValue: 'Deleted user' });
    }
    if (member.isActive === false) {
      const name =
        member.details?.fullName || member.email || member.username || '';
      return `${name} (${t('deactivated', { defaultValue: 'deactivated' })})`;
    }
    return member.details?.fullName;
  };

  const renderMemberLabel = (member: IUser) => {
    if (member.isDeleted) {
      return (
        <span className="text-muted-foreground">
          {t('deleted-user', { defaultValue: 'Deleted user' })}
        </span>
      );
    }
    if (member.isActive === false) {
      const name =
        member.details?.fullName || member.email || member.username || '';
      return (
        <>
          {name}{' '}
          <span className="text-muted-foreground">
            ({t('deactivated', { defaultValue: 'deactivated' })})
          </span>
        </>
      );
    }
    return member.details?.fullName;
  };

  const renderAvatar = (member: IUser) => {
    const { details, isDeleted, isActive } = member;
    const { avatar, fullName } = details || {};
    const isInactiveOrDeleted = isDeleted || isActive === false;

    return (
      <Tooltip delayDuration={100} key={member._id}>
        <Tooltip.Trigger asChild>
          <Avatar
            className={cn(
              'bg-background',
              valueMembers.length > 1 && 'ring-2 ring-background',
              isInactiveOrDeleted && 'opacity-60 grayscale',
              className,
            )}
            size={size || 'lg'}
            {...props}
          >
            {!isDeleted && (
              <Avatar.Image src={readImage(avatar as string, 200)} />
            )}
            <Avatar.Fallback>
              {isDeleted ? (
                <IconUserCancel className="size-3.5" />
              ) : (
                fullName?.charAt(0) || ''
              )}
            </Avatar.Fallback>
          </Avatar>
        </Tooltip.Trigger>
        <Tooltip.Content>
          <p>{renderMemberLabel(member)}</p>
        </Tooltip.Content>
      </Tooltip>
    );
  };

  if (valueMembers.length === 0) {
    if (allowUnassigned) {
      return (
        <IconUserCancel className="text-muted-foreground flex-none size-4" />
      );
    }
    return null;
  }

  if (valueMembers.length === 1) return renderAvatar(valueMembers[0]);

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
            <p>{restMembers.map((m) => getMemberLabel(m)).join(', ')}</p>
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
  const { t } = useTranslation('team-member');

  const valueMembers = memberIds?.length
    ? allMembers.filter((m) => memberIds.includes(m._id))
    : allMembers;
  const isCurrentUser = valueMembers.some((m) => m._id === currentUser._id);

  const renderMemberLabel = (member: IUser) => {
    if (member.isDeleted) {
      return (
        <span className="text-muted-foreground">
          {t('deleted-user', { defaultValue: 'Deleted user' })}
        </span>
      );
    }
    if (member.isActive === false) {
      const name =
        member.details?.fullName || member.email || member.username || '';
      return (
        <>
          {name}{' '}
          <span className="text-muted-foreground">
            ({t('deactivated', { defaultValue: 'deactivated' })})
          </span>
        </>
      );
    }
    return member.details?.fullName;
  };

  const getDisplayValue = () => {
    if (!valueMembers || valueMembers.length === 0) {
      if (allowUnassigned) {
        return (
          <span className="capitalize text-muted-foreground/80">
            No assignee
          </span>
        );
      }
      return undefined;
    }

    if (valueMembers.length === 1) {
      return renderMemberLabel(valueMembers[0]);
    }

    if (isCurrentUser) {
      const otherMembersCount = valueMembers.length - 1;
      if (otherMembersCount > 1) {
        return `You and ${otherMembersCount} others`;
      }

      const otherMember = valueMembers.find((m) => m._id !== currentUser._id);
      return otherMember ? (
        <>You and {renderMemberLabel(otherMember)}</>
      ) : (
        'You and '
      );
    }

    return `${valueMembers.length} members`;
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

import type { User } from '@erxes/core-contract';
import { Avatar, type AvatarProps, Badge, Combobox, Tooltip, cn, readImage } from 'erxes-ui';
import { useMembersById } from '~/lib/members';
import type { JSX } from 'react';
import { useSession } from '~/modules/auth/session';

export const memberLabelText = (member: User) => member.fullName || member.username || member.email;

/** A member's name, with an "Inactive" badge for disabled ones. */
const MemberLabel = ({ member }: { member: User }) =>
  member.status === 'active' ? (
    <>{memberLabelText(member)}</>
  ) : (
    <span className="inline-flex items-center gap-1">
      <span>{memberLabelText(member)}</span>
      <Badge variant="destructive" className="h-5 shrink-0 px-1.5 text-[11px]">
        Inactive
      </Badge>
    </span>
  );

const MemberAvatars = ({ members, size }: { members: User[]; size: AvatarProps['size'] }) => (
  <div className={cn('flex', members.length > 1 && '-space-x-1.5')}>
    {members.slice(0, 3).map((member) => (
      <Tooltip delayDuration={100} key={member.id}>
        <Tooltip.Trigger asChild>
          <Avatar
            className={cn('bg-background', members.length > 1 && 'ring-2 ring-background')}
            size={size}
          >
            <Avatar.Image src={readImage(member.avatarUrl)} />
            <Avatar.Fallback>{memberLabelText(member).charAt(0)}</Avatar.Fallback>
          </Avatar>
        </Tooltip.Trigger>
        <Tooltip.Content>
          <MemberLabel member={member} />
        </Tooltip.Content>
      </Tooltip>
    ))}
  </div>
);

/** Selected members: avatars, then the name. */
export const MembersInline = ({
  memberIds,
  placeholder,
  size = 'lg',
  className,
}: {
  memberIds: string[];
  placeholder?: string;
  size?: AvatarProps['size'];
  className?: string;
}) => {
  const members = useMembersById(memberIds);
  const { user } = useSession();
  const selected = memberIds.flatMap((id) => members.get(id) ?? []);
  const [first] = selected;
  let value: string | JSX.Element | undefined;

  if (selected.length === 1 && first) {
    value = <MemberLabel member={first} />;
  } else if (selected.length > 1) {
    value = selected.some((member) => member.id === user.id)
      ? `You and ${selected.length - 1} others`
      : `${selected.length} members`;
  }

  return (
    <Tooltip.Provider>
      {selected.length > 0 && <MemberAvatars members={selected} size={size} />}
      <Combobox.Value
        value={value}
        loading={memberIds.length > 0 && selected.length === 0}
        placeholder={placeholder ?? 'Select members'}
        className={className}
      />
    </Tooltip.Provider>
  );
};

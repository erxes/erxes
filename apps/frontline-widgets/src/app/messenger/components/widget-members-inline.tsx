import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Avatar, AvatarProps, cn, readImage } from 'erxes-ui';
import { useMemberInline, type IUser } from 'ui-modules';

interface IWdigetMembersInlineContext {
  members: IUser[];
}

const WdigetMembersInlineContext = createContext<IWdigetMembersInlineContext>({
  members: [],
});

const useWdigetMembersInlineContext = () =>
  useContext(WdigetMembersInlineContext);

const WdigetMemberFetcher = ({
  memberId,
  onResolve,
}: {
  memberId: string;
  onResolve: (member: IUser) => void;
}) => {
  const { userDetail } = useMemberInline({
    variables: { _id: memberId },
    skip: !memberId,
  });

  useEffect(() => {
    if (userDetail) onResolve(userDetail);
  }, [userDetail, onResolve]);

  return null;
};

export const WdigetMembersInlineProvider = ({
  memberIds,
  children,
}: {
  memberIds?: string[];
  children: ReactNode;
}) => {
  const [members, setMembers] = useState<IUser[]>([]);

  const handleResolve = useCallback((member: IUser) => {
    setMembers((prev) =>
      prev.some(({ _id }) => _id === member._id) ? prev : [...prev, member],
    );
  }, []);

  return (
    <WdigetMembersInlineContext.Provider value={{ members }}>
      {children}
      {memberIds?.map((memberId) => (
        <WdigetMemberFetcher
          key={memberId}
          memberId={memberId}
          onResolve={handleResolve}
        />
      ))}
    </WdigetMembersInlineContext.Provider>
  );
};

export const WdigetMembersInlineAvatar = ({
  className,
  size = 'sm',
  ...props
}: AvatarProps) => {
  const { members } = useWdigetMembersInlineContext();

  if (members.length === 0) return null;

  const renderAvatar = (member: IUser) => {
    const { avatar, fullName } = member.details || {};
    return (
      <Avatar
        key={member._id}
        size={size}
        className={cn('bg-background', className)}
        {...props}
      >
        <Avatar.Image src={readImage(avatar as string, 200)} />
        <Avatar.Fallback>{fullName?.charAt(0) || ''}</Avatar.Fallback>
      </Avatar>
    );
  };

  if (members.length === 1) return renderAvatar(members[0]);

  return (
    <div className="flex -space-x-1.5">
      {members.map((member) => renderAvatar(member))}
    </div>
  );
};

export const WdigetMembersInlineTitle = ({
  className,
}: {
  className?: string;
}) => {
  const { members } = useWdigetMembersInlineContext();

  if (members.length === 0) return null;

  const displayValue =
    members.length === 1
      ? members[0].details?.fullName
      : `${members.length} members`;

  return <span className={cn('truncate', className)}>{displayValue}</span>;
};

export const WdigetMembersInline = Object.assign(WdigetMembersInlineProvider, {
  Avatar: WdigetMembersInlineAvatar,
  Title: WdigetMembersInlineTitle,
});

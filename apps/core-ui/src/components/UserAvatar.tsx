import { Avatar, cn } from 'erxes-ui';

const initials = (name: string) =>
  name
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || '?';

export const UserAvatar = ({
  name,
  src,
  className,
}: {
  name: string;
  src?: string | null;
  className?: string;
}) => (
  <Avatar className={cn('size-7 rounded-md', className)}>
    {/* Full URLs and core file addresses (`/core/v1/files/<id>/download`). */}
    {src && /^(https?:\/\/|\/core\/)/.test(src) && <Avatar.Image src={src} alt="" />}
    <Avatar.Fallback className="rounded-md text-xs">{initials(name)}</Avatar.Fallback>
  </Avatar>
);

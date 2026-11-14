import { Avatar, type AvatarProps, cn } from 'erxes-ui';

const initials = (name: string) =>
  name
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || '?';

/** A team member's avatar: square, 28px unless the screen sizes it, initials without a photo. */
export const UserAvatar = ({
  name,
  src,
  className,
  corners = 'square',
  ...variants
}: Pick<AvatarProps, 'corners' | 'ring' | 'size'> & {
  name: string;
  src?: string | null;
  className?: string;
}) => (
  <Avatar corners={corners} {...variants} className={cn('size-7', className)}>
    {/* Full URLs and core file addresses (`/core/v1/files/<id>/download`). */}
    {src && /^(https?:\/\/|\/core\/)/.test(src) && <Avatar.Image src={src} alt="" />}
    <Avatar.Fallback>{initials(name)}</Avatar.Fallback>
  </Avatar>
);

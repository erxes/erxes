import { ReactNode } from 'react';

interface AvatarGroupProps {
  children: ReactNode;
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  xs: 'w-7 h-7',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
};
export function AvatarGroup({
  children,
  max,
  size = 'md',
  className = '',
}: AvatarGroupProps) {
  const avatars = Array.isArray(children) ? children : [children];
  const displayAvatars =
    typeof max === 'number' ? avatars.slice(0, max) : avatars;
  const extraCount =
    typeof max === 'number' && avatars.length > max ? avatars.length - max : 0;

  return (
    <div className={`flex -space-x-2 ${className}`}>
      {displayAvatars.map((child, idx) => (
        <div key={idx} className="inline-block">
          {child}
        </div>
      ))}
      {extraCount > 0 && (
        <span
          className={`inline-flex items-center justify-center rounded-full bg-zinc-200 text-zinc-500 text-xs font-medium border border-zinc-100 ${sizeMap[size]}`}
        >
          +{extraCount}
        </span>
      )}
    </div>
  );
}

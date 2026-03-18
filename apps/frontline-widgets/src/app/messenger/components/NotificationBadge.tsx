import { useAtomValue } from 'jotai';
import { unreadCountAtom } from '../states';

interface NotificationBadgeProps {
  children: React.ReactNode;
}

export const NotificationBadge = ({ children }: NotificationBadgeProps) => {
  const unreadCount = useAtomValue(unreadCountAtom);
  const label = unreadCount > 99 ? '99+' : String(unreadCount);

  return (
    <div className="relative inline-flex">
      {children}
      {unreadCount > 0 && (
        <span
          aria-label={`${unreadCount} unread messages`}
          className="
            absolute -top-1 -right-1
            min-w-[18px] h-[18px]
            bg-red-500 text-white
            text-[10px] font-bold leading-[18px]
            rounded-full text-center
            px-1 pointer-events-none
            flex items-center justify-center
            box-border
          "
        >
          {label}
        </span>
      )}
    </div>
  );
};

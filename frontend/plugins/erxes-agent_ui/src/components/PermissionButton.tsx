import { forwardRef, ComponentPropsWithoutRef } from 'react';
import { Button } from 'erxes-ui';

type Props = Omit<ComponentPropsWithoutRef<typeof Button>, 'onClick'> & {
  allowed: boolean;
  onDenied: () => void;
  onClick?: () => void;
};

/** A Button that stays clickable when not allowed so the click can surface a
 *  toaster — a native disabled button swallows the event entirely. */
export const PermissionButton = forwardRef<HTMLButtonElement, Props>(
  ({ allowed, onDenied, className, onClick, ...props }, ref) => {
    const cls = [className, !allowed ? 'opacity-50' : '']
      .filter(Boolean)
      .join(' ') || undefined;
    return (
      <Button
        ref={ref}
        aria-disabled={!allowed}
        className={cls}
        onClick={allowed ? onClick : onDenied}
        {...props}
      />
    );
  },
);

import React, { useMemo } from 'react';
import { TriggerContentWrapperProps } from '@/automations/components/builder/sidebar/types/sidebarContentTypes';

/**
 * Reusable wrapper component for trigger content with consistent layout
 */
export const TriggerContentWrapper = React.memo<TriggerContentWrapperProps>(
  ({ children, footer, className = '', 'aria-label': ariaLabel, ...props }) => {
    const wrapperClasses = useMemo(
      () => `flex flex-col h-full ${className}`.trim(),
      [className],
    );

    return (
      <div
        className={wrapperClasses}
        aria-label={ariaLabel}
        role="region"
        {...props}
      >
        <div className="flex-1 w-auto overflow-auto px-4">{children}</div>
        <footer className="p-3 flex justify-end border-t bg-background/50 backdrop-blur-sm">
          {footer}
        </footer>
      </div>
    );
  },
);

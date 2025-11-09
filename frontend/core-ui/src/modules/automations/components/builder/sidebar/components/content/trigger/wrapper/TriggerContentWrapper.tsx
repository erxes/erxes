import { TriggerContentWrapperProps } from '@/automations/components/builder/sidebar/types/sidebarContentTypes';
import React from 'react';

/**
 * Reusable wrapper component for trigger content with consistent layout
 */
export const TriggerContentWrapper = React.memo<TriggerContentWrapperProps>(
  ({ children, footer, className = '', 'aria-label': ariaLabel, ...props }) => {
    return (
      <div
        className={`flex flex-col h-full ${className}`}
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

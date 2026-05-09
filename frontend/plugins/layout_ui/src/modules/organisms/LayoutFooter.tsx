import * as React from 'react';
import { cn } from 'erxes-ui';
import { Text } from '../atoms/Text';

export type LayoutFooterProps = {
  start?: React.ReactNode;
  center?: React.ReactNode;
  end?: React.ReactNode;
  className?: string;
};

export const LayoutFooter: React.FC<LayoutFooterProps> = ({
  start,
  center,
  end,
  className,
}) => (
  <footer
    className={cn(
      'border-t bg-sidebar px-3 py-2 grid grid-cols-3 items-center gap-3',
      className,
    )}
  >
    <div className="flex items-center gap-2 justify-self-start">
      {start ?? <Text variant="small">Layout plugin</Text>}
    </div>
    <div className="flex items-center justify-center">
      {center ?? <Text variant="small">{`© ${new Date().getFullYear()}`}</Text>}
    </div>
    <div className="flex items-center gap-2 justify-self-end">{end}</div>
  </footer>
);

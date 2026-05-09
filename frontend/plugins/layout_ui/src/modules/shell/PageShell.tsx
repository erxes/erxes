import * as React from 'react';
import { cn } from 'erxes-ui';
import {
  LayoutFooter,
  LayoutFooterProps,
} from '../organisms/LayoutFooter';
import {
  LayoutHeader,
  LayoutHeaderProps,
} from '../organisms/LayoutHeader';

export type PageShellProps = {
  title?: string;
  header?: LayoutHeaderProps;
  footer?: LayoutFooterProps;
  className?: string;
  children?: React.ReactNode;
};

export const PageShell: React.FC<PageShellProps> = ({
  title,
  header,
  footer,
  className,
  children,
}) => (
  <div className="grid grid-rows-[auto_1fr_auto] h-full overflow-hidden">
    <LayoutHeader title={title} {...header} />
    <main className={cn('overflow-auto p-4', className)}>{children}</main>
    <LayoutFooter {...footer} />
  </div>
);

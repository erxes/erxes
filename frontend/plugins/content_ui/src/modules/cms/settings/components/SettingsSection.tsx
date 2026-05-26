import { Card } from 'erxes-ui';
import { PropsWithChildren, ReactNode } from 'react';

export const SettingsSection = ({
  id,
  title,
  badge,
  className = '',
  contentClassName,
  children,
}: PropsWithChildren<{
  id: string;
  title: string;
  badge?: ReactNode;
  className?: string;
  contentClassName?: string;
}>) => (
  <Card
    id={`cms-settings-${id}`}
    className={`rounded-lg border shadow-none ${className}`}
  >
    <Card.Header className="flex flex-row items-center justify-between gap-3 space-y-0 border-b px-4 py-3">
      <Card.Title className="text-sm">{title}</Card.Title>
      {badge}
    </Card.Header>
    <Card.Content className={contentClassName || 'space-y-4 p-4'}>
      {children}
    </Card.Content>
  </Card>
);

import { Card, cn } from 'erxes-ui';
import { type PropsWithChildren } from 'react';
import { type SettingsSectionProps } from '../types/settingsTypes';

export const SettingsSection = ({
  id,
  title,
  badge,
  className = '',
  contentClassName,
  children,
}: PropsWithChildren<SettingsSectionProps>) => (
  <Card
    id={`cms-settings-${id}`}
    className={cn('rounded-lg border shadow-none', className)}
  >
    <Card.Header className="flex flex-row items-center justify-between gap-3 space-y-0 border-b px-4 py-3">
      <Card.Title className="text-sm">{title}</Card.Title>
      {badge}
    </Card.Header>
    <Card.Content className={cn('space-y-4 p-4', contentClassName)}>
      {children}
    </Card.Content>
  </Card>
);

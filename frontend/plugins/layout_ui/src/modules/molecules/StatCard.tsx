import * as React from 'react';
import { Card, cn } from 'erxes-ui';
import { Icon } from '@tabler/icons-react';
import { Heading } from '../atoms/Heading';
import { Text } from '../atoms/Text';

export type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  icon?: Icon;
  className?: string;
};

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  hint,
  icon: IconCmp,
  className,
}) => (
  <Card className={cn('h-full', className)}>
    <Card.Header className="flex-row items-center justify-between space-y-0 pb-2">
      <Text variant="muted" className="font-medium">
        {label}
      </Text>
      {IconCmp && <IconCmp size={16} className="text-muted-foreground" />}
    </Card.Header>
    <Card.Content>
      <Heading level={2}>{value}</Heading>
      {hint && (
        <Text variant="small" className="mt-1">
          {hint}
        </Text>
      )}
    </Card.Content>
  </Card>
);

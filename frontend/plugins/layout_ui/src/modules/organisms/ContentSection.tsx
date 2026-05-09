import * as React from 'react';
import { Card, cn } from 'erxes-ui';
import { Heading } from '../atoms/Heading';
import { Text } from '../atoms/Text';

export type ContentSectionProps = {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
};

export const ContentSection: React.FC<ContentSectionProps> = ({
  title,
  description,
  children,
  className,
}) => (
  <Card className={cn('h-full flex flex-col', className)}>
    {(title || description) && (
      <Card.Header>
        {title && <Heading level={3}>{title}</Heading>}
        {description && <Text variant="muted">{description}</Text>}
      </Card.Header>
    )}
    <Card.Content className="flex-1">{children}</Card.Content>
  </Card>
);

import { type Icon } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { EmptyState } from '../../shared/EmptyState';

type AnalyticsStateProps = {
  actionLabel?: string;
  description: string;
  icon: Icon;
  onAction?: () => void;
  title: string;
};

export const AnalyticsState = ({
  actionLabel,
  description,
  icon,
  onAction,
  title,
}: AnalyticsStateProps) => {
  return (
    <div className="h-full p-4">
      <div className="h-full rounded-lg border bg-background">
        <EmptyState icon={icon} title={title} description={description}>
          {actionLabel && onAction ? (
            <Button onClick={onAction}>{actionLabel}</Button>
          ) : null}
        </EmptyState>
      </div>
    </div>
  );
};

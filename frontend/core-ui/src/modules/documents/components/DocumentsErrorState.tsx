import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';
import { Button, Empty } from 'erxes-ui';

type DocumentsErrorStateProps = Readonly<{
  description?: string;
  onRetry: () => void;
  title?: string;
}>;

/** Renders a retryable error state for document queries. */
export function DocumentsErrorState({
  description = 'Check your connection and try again.',
  onRetry,
  title = 'Couldn’t load documents',
}: DocumentsErrorStateProps) {
  return (
    <Empty className="h-full border-0 bg-transparent">
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconAlertTriangle className="text-destructive" />
        </Empty.Media>
        <Empty.Title>{title}</Empty.Title>
        <Empty.Description>{description}</Empty.Description>
      </Empty.Header>
      <Empty.Content>
        <Button variant="outline" onClick={onRetry}>
          <IconRefresh />
          Try again
        </Button>
      </Empty.Content>
    </Empty>
  );
}

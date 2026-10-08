import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';
import { Button, Empty } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

type DocumentsErrorStateProps = Readonly<{
  description?: string;
  onRetry: () => void;
  title?: string;
}>;

export function DocumentsErrorState({
  description = 'Check your connection and try again.',
  onRetry,
  title = 'Couldn’t load documents',
}: DocumentsErrorStateProps) {
  const { t } = useTranslation('documents', { keyPrefix: 'document' });

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
          {t('try-again')}
        </Button>
      </Empty.Content>
    </Empty>
  );
}

import { ApolloError } from '@apollo/client';
import { IconAlertTriangle, IconLock, IconRefresh } from '@tabler/icons-react';
import { Button, Empty } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

type DocumentsErrorStateProps = Readonly<{
  description?: string;
  error?: ApolloError;
  onRetry: () => void;
  title?: string;
}>;

export function DocumentsErrorState({
  description = 'Check your connection and try again.',
  error,
  onRetry,
  title = 'Couldn’t load documents',
}: DocumentsErrorStateProps) {
  const { t } = useTranslation('documents', { keyPrefix: 'document' });
  const { t: tNoAccess } = useTranslation('common', {
    keyPrefix: 'no-access',
  });

  const isPermissionError = error?.graphQLErrors.some(
    ({ message }) => message === 'Permission required',
  );

  if (isPermissionError) {
    return (
      <Empty className="h-full border-0 bg-transparent">
        <Empty.Header>
          <Empty.Media variant="icon">
            <IconLock />
          </Empty.Media>
          <Empty.Title>{tNoAccess('title')}</Empty.Title>
          <Empty.Description>{tNoAccess('description')}</Empty.Description>
        </Empty.Header>
      </Empty>
    );
  }

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
        {/* Apollo's refetch treats its first argument as variables, so never pass the click event. */}
        <Button variant="outline" onClick={() => onRetry()}>
          <IconRefresh />
          {t('try-again')}
        </Button>
      </Empty.Content>
    </Empty>
  );
}

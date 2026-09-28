import { EmailTemplatePath } from '@/types/paths/EmailTemplatePath';
import { ApolloError } from '@apollo/client';
import {
  IconAlertTriangle,
  IconMail,
  IconPlus,
  IconRefresh,
  IconSearchOff,
} from '@tabler/icons-react';
import { Button, cn, Empty, useMultiQueryState } from 'erxes-ui';
import { Link } from 'react-router';

/**
 * An empty list because of a filter needs the filter loosened; an empty list
 * because nothing has been written needs a template.
 */
export const EmailTemplatesEmptyState = ({
  className,
}: {
  className?: string;
}) => {
  const [queries] = useMultiQueryState<{ searchValue: string }>([
    'searchValue',
  ]);
  const isFiltered = !!queries?.searchValue;

  return (
    <Empty className={cn('m-3 min-h-[20rem]', className)}>
      <Empty.Header>
        <Empty.Media variant="icon">
          {isFiltered ? <IconSearchOff /> : <IconMail />}
        </Empty.Media>
        <Empty.Title>
          {isFiltered ? 'No template matches' : 'No email templates yet'}
        </Empty.Title>
        <Empty.Description>
          {isFiltered
            ? 'Try a different search, or clear the filter.'
            : 'Write one once and reuse it in campaigns and automations.'}
        </Empty.Description>
      </Empty.Header>
      {!isFiltered && (
        <Empty.Content>
          <Button asChild>
            <Link to={EmailTemplatePath.Create}>
              <IconPlus />
              Create template
            </Link>
          </Button>
        </Empty.Content>
      )}
    </Empty>
  );
};

export const EmailTemplatesErrorState = ({
  className,
  error,
  onRetry,
}: {
  className?: string;
  error?: ApolloError | Error;
  onRetry?: () => void;
}) => (
  <Empty className={cn('m-3 min-h-[20rem] bg-accent/30', className)}>
    <Empty.Header>
      <Empty.Media variant="icon">
        <IconAlertTriangle className="text-destructive" />
      </Empty.Media>
      <Empty.Title>Could not load email templates</Empty.Title>
      <Empty.Description className="break-words">
        {error?.message || 'Something went wrong.'}
      </Empty.Description>
    </Empty.Header>
    {!!onRetry && (
      <Empty.Content>
        <Button variant="outline" onClick={onRetry}>
          <IconRefresh />
          Retry
        </Button>
      </Empty.Content>
    )}
  </Empty>
);

import { ApolloError } from '@apollo/client';
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';
import { Button, Collapsible, Empty, cn } from 'erxes-ui';
import { useState } from 'react';

export const AutomationErrorEmptyState = ({
  className,
  error,
  onRetry,
  title = 'Something went wrong',
}: {
  className?: string;
  error?: ApolloError | Error;
  onRetry?: () => void;
  title?: string;
}) => {
  const [isOpen, setOpen] = useState(false);
  const graphQLErrors =
    (error as ApolloError)?.graphQLErrors?.map(({ message }) => message) || [];
  const message = error?.message || 'Unknown error';
  const hasMore = graphQLErrors.length > 1;

  return (
    <Empty className={cn('m-3 min-h-[20rem] bg-accent/30', className)}>
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconAlertTriangle className="text-destructive" />
        </Empty.Media>
        <Empty.Title>{title}</Empty.Title>
        <Empty.Description className="break-words">{message}</Empty.Description>
      </Empty.Header>
      <Empty.Content>
        <div className="flex flex-col items-center gap-3">
          {onRetry && (
            <Button variant="outline" onClick={onRetry}>
              <IconRefresh />
              Try again
            </Button>
          )}

          {hasMore && (
            <Collapsible open={isOpen} onOpenChange={setOpen}>
              <Collapsible.Trigger asChild>
                <Button variant="ghost" size="sm" className="text-xs">
                  {isOpen
                    ? 'Hide details'
                    : `Show ${graphQLErrors.length} errors`}
                </Button>
              </Collapsible.Trigger>
              <Collapsible.Content>
                <ul className="mt-2 max-h-40 max-w-lg space-y-1 overflow-auto rounded-md border bg-background p-3 text-left font-mono text-xs">
                  {graphQLErrors.map((graphQLError, index) => (
                    <li
                      key={`${graphQLError}-${index}`}
                      className="break-words"
                    >
                      {graphQLError}
                    </li>
                  ))}
                </ul>
              </Collapsible.Content>
            </Collapsible>
          )}
        </div>
      </Empty.Content>
    </Empty>
  );
};

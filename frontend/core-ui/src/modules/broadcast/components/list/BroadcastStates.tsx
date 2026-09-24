import { ApolloError } from '@apollo/client';
import {
  IconAlertTriangle,
  IconBroadcast,
  IconRefresh,
  IconSearchOff,
} from '@tabler/icons-react';
import { Button, cn, Empty } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useBroadcastIsFiltered } from '../../hooks/useBroadcastIsFiltered';
import { BroadcastMethod } from './BroadcastMethod';

/**
 * Nothing to show, and the two reasons for it are not the same thing.
 *
 * A campaign list that is empty because a filter excluded everything needs the
 * filter loosened; one that is empty because nothing has been built needs a
 * campaign. Offering "New broadcast" to someone who has thirty of them behind
 * a filter is the unhelpful half of that.
 */
export const BroadcastEmptyState = ({ className }: { className?: string }) => {
  const { t } = useTranslation('broadcasts');
  const isFiltered = useBroadcastIsFiltered();

  return (
    <Empty className={cn('m-3 min-h-[20rem]', className)}>
      <Empty.Header>
        <Empty.Media variant="icon">
          {isFiltered ? <IconSearchOff /> : <IconBroadcast />}
        </Empty.Media>
        <Empty.Title>
          {t(isFiltered ? 'empty.filtered-title' : 'empty.title')}
        </Empty.Title>
        <Empty.Description>
          {t(isFiltered ? 'empty.filtered-body' : 'empty.body')}
        </Empty.Description>
      </Empty.Header>
      {!isFiltered && (
        <Empty.Content>
          <BroadcastMethod />
        </Empty.Content>
      )}
    </Empty>
  );
};

export const BroadcastErrorState = ({
  className,
  error,
  onRetry,
}: {
  className?: string;
  error?: ApolloError | Error;
  onRetry?: () => void;
}) => {
  const { t } = useTranslation('broadcasts');

  return (
    <Empty className={cn('m-3 min-h-[20rem] bg-accent/30', className)}>
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconAlertTriangle className="text-destructive" />
        </Empty.Media>
        <Empty.Title>{t('error.title')}</Empty.Title>
        <Empty.Description className="break-words">
          {error?.message || t('error.unknown')}
        </Empty.Description>
      </Empty.Header>
      {!!onRetry && (
        <Empty.Content>
          <Button variant="outline" onClick={onRetry}>
            <IconRefresh />
            {t('error.retry')}
          </Button>
        </Empty.Content>
      )}
    </Empty>
  );
};

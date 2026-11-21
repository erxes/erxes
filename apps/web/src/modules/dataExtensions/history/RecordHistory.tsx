import type { DataExtensionChange } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { IconClockEdit } from '@tabler/icons-react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Button, Empty, RelativeDateDisplay, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { QueryState } from '~/components/QueryState';
import { forwardPaging } from '~/lib/cursorList';
import { ChangeLines } from './ChangeLines';

const Entry = ({ entry }: { entry: DataExtensionChange }) => {
  const { t } = useTranslation('data', { keyPrefix: 'history' });
  const actor = entry.actorName ?? t('someone', 'Someone');

  return (
    <li className="flex flex-col gap-1">
      <p className="text-sm">
        <span className="font-medium">{actor}</span>{' '}
        <span className="text-muted-foreground">
          {entry.kind === 'created'
            ? t('created', 'created the record')
            : t('updated', 'changed values')}
        </span>{' '}
        <span className="text-xs text-muted-foreground">
          <RelativeDateDisplay value={entry.occurredAt} render={<span />}>
            <RelativeDateDisplay.Value value={entry.occurredAt} />
          </RelativeDateDisplay>
        </span>
      </p>
      <ChangeLines changes={entry.changes} />
    </li>
  );
};

const NoHistory = () => {
  const { t } = useTranslation('data', { keyPrefix: 'history' });

  return (
    <Empty>
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconClockEdit />
        </Empty.Media>
        <Empty.Title>{t('empty', 'No changes yet')}</Empty.Title>
        <Empty.Description>
          {t(
            'empty-description',
            'Each change to a value shows here: who made it, when, and what it was.',
          )}
        </Empty.Description>
      </Empty.Header>
    </Empty>
  );
};

/** Who changed a record's values, when and from what, newest first; older ones load on demand. */
export const RecordHistory = ({
  recordType,
  recordId,
}: {
  recordType: string;
  recordId: string;
}) => {
  const { t } = useTranslation('data', { keyPrefix: 'history' });

  const history = useInfiniteQuery(
    orpc.dataChanges.history.infiniteOptions({
      input: (page) => ({ ...page, recordType, recordId }),
      ...forwardPaging(20),
    }),
  );

  return (
    <QueryState
      query={history}
      isEmpty={({ pages }) => !pages.some((page) => page.data.length)}
      empty={<NoHistory />}
    >
      {({ pages }) => (
        <div className="flex flex-col gap-4">
          <ul className="flex flex-col gap-4">
            {pages
              .flatMap((page) => page.data)
              .map((entry) => (
                <Entry key={entry.id} entry={entry} />
              ))}
          </ul>
          {history.hasNextPage && (
            <Button
              variant="outline"
              className="self-center"
              disabled={history.isFetchingNextPage}
              onClick={() => void history.fetchNextPage()}
            >
              {history.isFetchingNextPage && <Spinner size="sm" />}
              {t('more', 'Show older changes')}
            </Button>
          )}
        </div>
      )}
    </QueryState>
  );
};

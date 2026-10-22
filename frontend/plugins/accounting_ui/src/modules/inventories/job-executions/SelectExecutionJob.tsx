import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { Button, Combobox, Command, Form, Popover, Spinner } from 'erxes-ui';
import { useDebounce } from 'use-debounce';
import { GET_JOBS } from '@/settings/jobs/graphql/jobQueries';
import { IJob } from '@/settings/jobs/types/Job';

export const SelectExecutionJob = ({
  label,
  onChange,
}: {
  label: string;
  onChange: (card: IJob) => void;
}) => {
  const { t } = useTranslation('accounting');
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Form.Control>
        <Combobox.Trigger aria-label={t('production-job')}>
          {label || t('production-job')}
        </Combobox.Trigger>
      </Form.Control>
      <Combobox.Content>
        {open && (
          <ExecutionJobSelectContent
            onChange={(job) => {
              onChange(job);
              setOpen(false);
            }}
          />
        )}
      </Combobox.Content>
    </Popover>
  );
};

export const ExecutionJobSelectContent = ({
  onChange,
  selectedId,
  activeOnly = true,
}: {
  onChange: (job: IJob) => void;
  selectedId?: string;
  activeOnly?: boolean;
}) => {
  const { t } = useTranslation('accounting');
  const [search, setSearch] = useState('');
  const [searchValue] = useDebounce(search, 300);
  const { data, loading, error, refetch } = useQuery(GET_JOBS, {
    variables: {
      searchValue,
      status: activeOnly ? 'active' : undefined,
      page: 1,
      perPage: 100,
    },
  });
  return (
    <Command shouldFilter={false}>
      <Command.Input
        value={search}
        onValueChange={setSearch}
        placeholder={t('search')}
        variant="secondary"
      />
      <Command.List>
        {loading && <Spinner />}
        {error && (
          <Button type="button" variant="ghost" onClick={() => void refetch()}>
            {t('job-retry')}
          </Button>
        )}
        {!loading && !error && (
          <Command.Empty>{t('production-no-cards')}</Command.Empty>
        )}
        {(data?.jobs?.jobs ?? [])
          .flatMap((card) => (card ? [card] : []))
          .map((card) => (
            <Command.Item
              key={card._id}
              value={card._id}
              onSelect={() => {
                onChange(card);
              }}
            >
              {card.code} {card.name}
              <Combobox.Check checked={selectedId === card._id} />
            </Command.Item>
          ))}
      </Command.List>
    </Command>
  );
};

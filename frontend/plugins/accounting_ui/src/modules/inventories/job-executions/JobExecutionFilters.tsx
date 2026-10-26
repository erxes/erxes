import { useState } from 'react';
import {
  IconCircleCheck,
  IconSearch,
  IconBuilding,
  IconShoppingCart,
} from '@tabler/icons-react';
import {
  Combobox,
  Command,
  Filter,
  Dialog,
  Input,
  Button,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { SelectProduct, SelectBranches, SelectDepartments } from 'ui-modules';
import { SelectAccount } from '@/settings/account/components/SelectAccount';
import { AccountsInline } from '@/settings/account/components/AccountsInline';
import { JournalEnum } from '@/settings/account/types/Account';
import { useJobExecutionFilters } from './useJobExecutionFilters';
import { useQuery } from '@apollo/client';
import { GET_JOB_DETAIL } from '@/settings/jobs/graphql/jobQueries';
import { ExecutionJobSelectContent } from './SelectExecutionJob';

const ExecutionJobFilter = () => {
  const [jobId, setJobId] = useQueryState<string>('jobId');
  const { resetFilterState } = useFilterContext();
  return (
    <ExecutionJobSelectContent
      activeOnly={false}
      selectedId={jobId ?? undefined}
      onChange={(job) => {
        setJobId(job._id === jobId ? null : job._id);
        resetFilterState();
      }}
    />
  );
};

const ExecutionJobFilterValue = ({ jobId }: { jobId?: string }) => {
  const { data } = useQuery(GET_JOB_DETAIL, {
    variables: { _id: jobId ?? '' },
    skip: !jobId,
  });
  const job = data?.jobDetail;
  return <>{job ? [job.code, job.name].filter(Boolean).join(' - ') : jobId}</>;
};

const ExecutionTextFilter = ({
  filterKey,
  label,
}: {
  filterKey: string;
  label: string;
}) => {
  const { t } = useTranslation('accounting');
  const [query, setQuery] = useQueryState<string>(filterKey);
  const [value, setValue] = useState(query ?? '');
  const { resetFilterState } = useFilterContext();
  return (
    <Dialog.Content>
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          setQuery(value.trim() || null);
          resetFilterState();
        }}
      >
        <Dialog.Header>
          <Dialog.Title>{t('filter-by', { label })}</Dialog.Title>
        </Dialog.Header>
        <Input
          aria-label={label}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          autoFocus
        />
        <Dialog.Footer>
          <Button type="button" variant="secondary" onClick={resetFilterState}>
            {t('cancel')}
          </Button>
          <Button type="submit">{t('apply')}</Button>
        </Dialog.Footer>
      </form>
    </Dialog.Content>
  );
};

const ExecutionAccountFilter = ({ filterKey }: { filterKey: string }) => {
  const [value, setValue] = useQueryState<string>(filterKey);
  const { resetFilterState } = useFilterContext();
  return (
    <Filter.View filterKey={filterKey}>
      <SelectAccount.Provider
        mode="single"
        value={value ?? ''}
        defaultFilter={{
          journals: [JournalEnum.INVENTORY],
          permissionMode: 'read',
        }}
        onValueChange={(account) => {
          setValue(typeof account === 'string' ? account : null);
          resetFilterState();
        }}
      >
        <SelectAccount.Content />
      </SelectAccount.Provider>
    </Filter.View>
  );
};

const executionStatuses = ['draft', 'posting', 'posted', 'undoing', 'error'];

const ExecutionStatusFilter = () => {
  const { t } = useTranslation('accounting');
  const [status, setStatus] = useQueryState<string>('status');
  const { resetFilterState } = useFilterContext();
  return (
    <Command>
      <Command.Input placeholder={t('status')} variant="secondary" />
      <Command.List>
        {executionStatuses.map((value) => (
          <Command.Item
            key={value}
            value={t(`production-status-${value}`)}
            onSelect={() => {
              setStatus(status === value ? null : value);
              resetFilterState();
            }}
          >
            {t(`production-status-${value}`)}
            <Combobox.Check checked={status === value} />
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};

export const JobExecutionFilters = () => {
  const { t } = useTranslation('accounting');
  const [status] = useQueryState<string>('status');
  const filters = useJobExecutionFilters();
  const textFilters = [
    { key: 'searchValue', label: t('search') },
    { key: 'jobName', label: `${t('production-job')}: ${t('name')}` },
    { key: 'laborCostName', label: t('job-labor-name') },
    { key: 'overheadCostName', label: t('job-overhead-name') },
  ] as const;
  const sides = ['input', 'output'] as const;
  return (
    <Filter id="job-executions-filter">
      <Filter.Bar>
        <Filter.BarItem queryKey="jobId">
          <Filter.BarName>
            <IconShoppingCart />
            {t('production-job')}
          </Filter.BarName>
          <Filter.BarButton filterKey="jobId">
            <ExecutionJobFilterValue jobId={filters.jobId} />
          </Filter.BarButton>
        </Filter.BarItem>
        {textFilters.map(({ key, label }) => (
          <Filter.BarItem key={key} queryKey={key}>
            <Filter.BarName>
              <IconSearch />
              {label}
            </Filter.BarName>
            <Filter.BarButton filterKey={key} inDialog>
              {filters[key]}
            </Filter.BarButton>
          </Filter.BarItem>
        ))}
        {sides.map((side) => (
          <SelectProduct.FilterBar
            key={side}
            filterKey={`${side}ProductId`}
            mode="single"
            label={t(`job-${side}-products`)}
          />
        ))}
        {sides.map((side) => (
          <Filter.BarItem key={side} queryKey={`${side}AccountId`}>
            <Filter.BarName>
              <IconShoppingCart />
              {t(`production-${side}-location`)}: {t('account')}
            </Filter.BarName>
            <Filter.BarButton filterKey={`${side}AccountId`}>
              <AccountsInline
                accountIds={[filters[`${side}AccountId`]].filter(
                  (id): id is string => Boolean(id),
                )}
                permissionMode="read"
              />
            </Filter.BarButton>
          </Filter.BarItem>
        ))}
        {sides.map((side) => (
          <SelectBranches.FilterBar
            key={side}
            filterKey={`${side}BranchId`}
            mode="single"
            label={[t('production-' + side + '-location'), t('branch')].join(
              ': ',
            )}
          />
        ))}
        {sides.map((side) => (
          <SelectDepartments.FilterBar
            key={side}
            filterKey={`${side}DepartmentId`}
            mode="single"
            label={[
              t('production-' + side + '-location'),
              t('department'),
            ].join(': ')}
          />
        ))}
        <Filter.BarItem queryKey="status">
          <Filter.BarName>
            <IconCircleCheck />
            {t('status')}
          </Filter.BarName>
          <Filter.BarButton filterKey="status">
            {status && t(`production-status-${status}`)}
          </Filter.BarButton>
        </Filter.BarItem>
        <Filter.Popover scope="job-executions-filter">
          <Filter.Trigger isFiltered={Object.values(filters).some(Boolean)} />
          <Combobox.Content>
            <Filter.View>
              <Command>
                <Filter.CommandInput
                  placeholder={t('filter')}
                  variant="secondary"
                />
                <Command.List>
                  <Filter.Item value="jobId">
                    <IconShoppingCart />
                    {t('production-job')}
                  </Filter.Item>
                  {textFilters.map(({ key, label }) => (
                    <Filter.Item key={key} value={key} inDialog>
                      <IconSearch />
                      {label}
                    </Filter.Item>
                  ))}
                  {sides.map((side) => (
                    <SelectProduct.FilterItem
                      key={side}
                      value={`${side}ProductId`}
                      label={t(`job-${side}-products`)}
                    />
                  ))}
                  {sides.map((side) => (
                    <Command.Group
                      key={side}
                      heading={t(`production-${side}-location`)}
                    >
                      <Filter.Item value={`${side}AccountId`}>
                        <IconShoppingCart />
                        {t('account')}
                      </Filter.Item>
                      <Filter.Item value={`${side}BranchId`}>
                        <IconBuilding />
                        {t('branch')}
                      </Filter.Item>
                      <Filter.Item value={`${side}DepartmentId`}>
                        <IconBuilding />
                        {t('department')}
                      </Filter.Item>
                    </Command.Group>
                  ))}
                  <Filter.Item value="status">
                    <IconCircleCheck />
                    {t('status')}
                  </Filter.Item>
                </Command.List>
              </Command>
            </Filter.View>
            <Filter.View filterKey="status">
              <ExecutionStatusFilter />
            </Filter.View>
            <Filter.View filterKey="jobId">
              <ExecutionJobFilter />
            </Filter.View>
            {sides.map((side) => (
              <SelectProduct.FilterView
                key={side}
                filterKey={`${side}ProductId`}
                mode="single"
              />
            ))}
            {sides.map((side) => (
              <ExecutionAccountFilter
                key={side}
                filterKey={`${side}AccountId`}
              />
            ))}
            {sides.map((side) => (
              <SelectBranches.FilterView
                key={side}
                filterKey={`${side}BranchId`}
                mode="single"
              />
            ))}
            {sides.map((side) => (
              <SelectDepartments.FilterView
                key={side}
                filterKey={`${side}DepartmentId`}
                mode="single"
              />
            ))}
          </Combobox.Content>
        </Filter.Popover>
      </Filter.Bar>
      <Filter.Dialog>
        {textFilters.map(({ key, label }) => (
          <Filter.View key={key} filterKey={key} inDialog>
            <ExecutionTextFilter filterKey={key} label={label} />
          </Filter.View>
        ))}
      </Filter.Dialog>
    </Filter>
  );
};

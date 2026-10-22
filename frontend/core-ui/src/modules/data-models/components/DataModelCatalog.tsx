import { useQuery } from '@apollo/client';
import {
  IconChevronRight,
  IconLayoutGrid,
  IconList,
  IconPlus,
  IconSearch,
} from '@tabler/icons-react';
import {
  Button,
  Input,
  PageContainer,
  ScrollArea,
  Select,
  Table,
  Tabs,
} from 'erxes-ui';
import { lazy, Suspense, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Can, PageHeader } from 'ui-modules';
import { DATA_MODEL_LIST } from '../graphql';
import {
  DATA_MODEL_PAGE_SIZE,
  modelPath,
  type DataModel,
  type OffsetList,
} from '../types';
import {
  DataModelError,
  DataModelLoading,
  DataModelPagination,
} from './DataModelFeedback';
import { DataModelForm } from './DataModelForm';
import { DATA_MODEL_TABLE_CLASS, DataModelIcon } from './DataModelVisuals';

const DataModelOverview = lazy(() =>
  import('./DataModelOverview').then((module) => ({
    default: module.DataModelOverview,
  })),
);

export const DataModelCatalog = () => {
  const [archived, setArchived] = useState(false);
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get('view') === 'list' ? 'list' : 'overview';
  const { data, loading, error, refetch } = useQuery<{
    dataModelList: OffsetList<DataModel>;
  }>(DATA_MODEL_LIST, {
    variables: { archived, limit: DATA_MODEL_PAGE_SIZE, offset },
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });
  const result = data?.dataModelList;
  const needle = search.trim().toLowerCase();
  const models = (result?.list ?? []).filter(
    (model) =>
      !needle ||
      `${model.name} ${model.labelPlural} ${model.labelSingular}`
        .toLowerCase()
        .includes(needle),
  );
  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <h1 className="text-sm font-medium">Data Models</h1>
          <IconChevronRight className="size-3.5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {view === 'overview' ? 'Overview' : 'Objects'}
          </span>
        </PageHeader.Start>
        <PageHeader.End>
          <Can action="dataModelsManage">
            <Button onClick={() => setCreating(true)}>
              <IconPlus />
              New model
            </Button>
          </Can>
        </PageHeader.End>
      </PageHeader>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-2.5">
        <Tabs
          value={view}
          onValueChange={(value) =>
            setSearchParams((previous) => {
              const next = new URLSearchParams(previous);
              if (value === 'list') next.set('view', 'list');
              else next.delete('view');
              return next;
            })
          }
        >
          <Tabs.List variant="segment">
            <Tabs.Trigger value="overview">
              <IconLayoutGrid className="size-3.5" />
              Overview
            </Tabs.Trigger>
            <Tabs.Trigger value="list">
              <IconList className="size-3.5" />
              Objects
            </Tabs.Trigger>
          </Tabs.List>
        </Tabs>
        <div className="flex min-w-0 flex-wrap gap-2">
          <div className="relative">
            <IconSearch className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Search models on this page"
              placeholder="Search objects…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-8 w-48 bg-muted/40 pl-8 shadow-none"
            />
          </div>
          <Select
            value={archived ? 'archived' : 'active'}
            onValueChange={(value) => {
              setArchived(value === 'archived');
              setOffset(0);
            }}
          >
            <Select.Trigger
              className="h-8 w-36 text-xs"
              aria-label="Model status"
            >
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="active">Active models</Select.Item>
              <Select.Item value="archived">Archived models</Select.Item>
            </Select.Content>
          </Select>
        </div>
      </div>
      {error ? (
        <DataModelError
          error={error}
          onRetry={() => {
            void refetch().catch(() => undefined);
          }}
        />
      ) : loading && !result ? (
        <DataModelLoading />
      ) : !models.length ? (
        <div className="flex flex-1 items-center justify-center p-12">
          <div className="text-center">
            <p className="text-sm font-medium">
              {needle
                ? 'No matching objects'
                : archived
                ? 'No archived models'
                : 'No models on this page'}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {needle
                ? 'Try another name or browse another page.'
                : archived
                ? 'Archived objects will appear here.'
                : 'Create a model to define your own fields and records.'}
            </p>
          </div>
        </div>
      ) : view === 'overview' ? (
        <Suspense fallback={<DataModelLoading />}>
          <DataModelOverview models={models} />
        </Suspense>
      ) : (
        <ScrollArea className="min-h-0 flex-1">
          <div className="mx-auto max-w-4xl px-6 py-10">
            <div className="mb-6">
              <h2 className="text-sm font-medium">Objects</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                The objects that make up your workspace.
              </p>
            </div>
            <div className="overflow-x-auto">
              <Table className={`min-w-[36rem] ${DATA_MODEL_TABLE_CLASS}`}>
                <Table.Header>
                  <Table.Row>
                    <Table.Head className="w-2/5">Name</Table.Head>
                    <Table.Head>API name</Table.Head>
                    <Table.Head>Source</Table.Head>
                    <Table.Head className="w-10">
                      <span className="sr-only">Open object</span>
                    </Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {models.map((model) => (
                    <Table.Row key={model._id}>
                      <Table.Cell>
                        <Link
                          to={modelPath(model._id)}
                          className="flex min-h-10 items-center gap-2 text-sm transition-colors hover:text-primary"
                        >
                          <DataModelIcon name={model.name} icon={model.icon} />
                          <span className="truncate">{model.labelPlural}</span>
                        </Link>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="truncate font-mono text-xs text-muted-foreground">
                          {model.name}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-xs text-muted-foreground">
                          {model.source === 'BUILTIN' ? 'Built-in' : 'Custom'}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <Button variant="ghost" size="icon" asChild>
                          <Link
                            to={modelPath(model._id)}
                            aria-label={`Open ${model.labelPlural}`}
                          >
                            <IconChevronRight className="size-3.5 text-muted-foreground" />
                          </Link>
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          </div>
        </ScrollArea>
      )}
      {(result?.totalCount ?? 0) > DATA_MODEL_PAGE_SIZE && (
        <DataModelPagination
          offset={offset}
          total={result?.totalCount ?? 0}
          pageSize={DATA_MODEL_PAGE_SIZE}
          onChange={setOffset}
          disabled={loading}
        />
      )}
      {creating && <DataModelForm onClose={() => setCreating(false)} />}
    </PageContainer>
  );
};

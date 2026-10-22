import { useQuery } from '@apollo/client';
import {
  IconArrowUpRight,
  IconChevronRight,
  IconListDetails,
  IconPlus,
  IconSettings,
} from '@tabler/icons-react';
import { Badge, Button, PageContainer, ScrollArea, Tabs } from 'erxes-ui';
import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Can, PageHeader } from 'ui-modules';
import { DATA_MODEL_DETAIL } from '../graphql';
import { DATA_MODELS_PATH, type DataModel } from '../types';
import { DataModelError, DataModelLoading } from './DataModelFeedback';
import { DataModelSettings } from './DataModelSettings';
import { DataModelLifecycle } from './DataModelLifecycle';
import { DataModelFields } from './DataModelFields';
import { DataModelFieldForm } from './DataModelFieldForm';
import { DataModelRecords } from './DataModelRecords';
import { DataModelIcon } from './DataModelVisuals';
import { ContactsPath } from '@/types/paths/ContactsPath';
import { ProductsPath } from '@/types/paths/ProductsPath';
import { SettingsWorkspacePath } from '@/types/paths/SettingsPath';

const businessDestinations: Record<string, { path: string; action: string }> = {
  customer: {
    path: `${ContactsPath.Index}${ContactsPath.Customers}`,
    action: 'contactsRead',
  },
  company: {
    path: `${ContactsPath.Index}${ContactsPath.Companies}`,
    action: 'contactsRead',
  },
  product: { path: ProductsPath.Products, action: 'productsRead' },
  user: {
    path: `/settings/${SettingsWorkspacePath.TeamMember}`,
    action: 'teamMembersRead',
  },
};

export const DataModelDetail = () => {
  const { modelId = '' } = useParams<{ modelId: string }>();
  return <DataModelDetailPage key={modelId} modelId={modelId} />;
};

const DataModelDetailPage = ({ modelId }: { modelId: string }) => {
  const { data, previousData, loading, error, refetch } = useQuery<{
    dataModelDetail: DataModel;
  }>(DATA_MODEL_DETAIL, {
    variables: { _id: modelId },
    fetchPolicy: 'cache-and-network',
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = ['settings', 'records'].includes(
    searchParams.get('tab') ?? '',
  )
    ? searchParams.get('tab') ?? 'fields'
    : 'fields';
  const setTab = (value: string) =>
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      if (value === 'fields') next.delete('tab');
      else next.set('tab', value);
      return next;
    });
  const [lifecycle, setLifecycle] = useState<DataModel | null>(null);
  const [creatingField, setCreatingField] = useState(false);
  const model = data?.dataModelDetail ?? previousData?.dataModelDetail;
  if (error && !model)
    return (
      <DataModelError
        error={error}
        onRetry={() => {
          void refetch().catch(() => undefined);
        }}
      />
    );
  if (!model)
    return loading ? (
      <DataModelLoading />
    ) : (
      <p className="p-6">Model not found.</p>
    );
  const custom = model.source === 'CUSTOM';
  const business = !custom ? businessDestinations[model.name] : undefined;
  const tab = !custom && requestedTab === 'records' ? 'fields' : requestedTab;
  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <Link
            to={DATA_MODELS_PATH}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Data Models
          </Link>
          <IconChevronRight className="size-3.5 text-muted-foreground" />
          <DataModelIcon name={model.name} icon={model.icon} />
          <h1 className="truncate text-sm font-medium">{model.labelPlural}</h1>
          {model.archivedAt && <Badge variant="secondary">Archived</Badge>}
        </PageHeader.Start>
        <PageHeader.End>
          {business && (
            <Can action={business.action}>
              <Button variant="ghost" asChild>
                <Link to={business.path}>
                  <IconArrowUpRight />
                  Open records
                </Link>
              </Button>
            </Can>
          )}
          {custom && !model.archivedAt && (
            <Can action="dataModelRecordsRead">
              <Button variant="ghost" onClick={() => setTab('records')}>
                <IconArrowUpRight />
                See records
              </Button>
            </Can>
          )}
          {!model.archivedAt && (
            <Can action="dataModelsManage">
              <Button onClick={() => setCreatingField(true)}>
                <IconPlus />
                New field
              </Button>
            </Can>
          )}
        </PageHeader.End>
      </PageHeader>
      {error && (
        <DataModelError
          error={error}
          onRetry={() => {
            void refetch().catch(() => undefined);
          }}
        />
      )}
      {model.archivedAt ? (
        <div className="mx-auto w-full max-w-3xl space-y-5 px-6 py-12">
          <h2 className="text-base font-medium">{model.labelPlural}</h2>
          <p className="text-sm text-muted-foreground">
            This model is archived. Restore it to manage fields or access its
            records. Existing data has not been deleted.
          </p>
          <Can action="dataModelsManage">
            <Button variant="outline" onClick={() => setLifecycle(model)}>
              Restore
            </Button>
          </Can>
        </div>
      ) : (
        <Tabs
          value={tab}
          onValueChange={setTab}
          className="flex min-h-0 flex-1 flex-col gap-0"
        >
          <div className="border-b bg-muted/20 px-6 pt-6">
            <div className="mx-auto max-w-5xl">
              <div className="mb-5 flex items-start gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border bg-background">
                  <DataModelIcon name={model.name} icon={model.icon} />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold tracking-tight">
                      {model.labelPlural}
                    </h2>
                    <Badge variant="secondary">
                      {custom ? 'Custom object' : 'Built-in object'}
                    </Badge>
                  </div>
                  <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                    {model.description ||
                      (custom
                        ? 'Define the information your team keeps and connect it to other records.'
                        : 'Add information and relationships without changing the built-in business fields.')}
                  </p>
                </div>
              </div>
              <Tabs.List className="border-0">
                <Tabs.Trigger value="fields" className="gap-1.5">
                  <IconListDetails className="size-3.5" />
                  Fields
                </Tabs.Trigger>
                <Tabs.Trigger value="settings" className="gap-1.5">
                  <IconSettings className="size-3.5" />
                  Settings
                </Tabs.Trigger>
                {custom && <Tabs.Trigger value="records">Records</Tabs.Trigger>}
              </Tabs.List>
            </div>
          </div>
          <ScrollArea className="min-h-0 flex-1">
            <div
              className={`mx-auto w-full px-6 py-10 ${
                tab === 'records'
                  ? 'max-w-6xl'
                  : tab === 'fields'
                  ? 'max-w-5xl'
                  : 'max-w-3xl'
              }`}
            >
              <Tabs.Content value="fields" className="mt-0">
                <DataModelFields model={model} />
              </Tabs.Content>
              <Tabs.Content value="settings" className="mt-0">
                <DataModelSettings
                  model={model}
                  onReload={async () => (await refetch()).data.dataModelDetail}
                  onArchive={() => setLifecycle(model)}
                />
              </Tabs.Content>
              {custom && (
                <Tabs.Content value="records" className="mt-0">
                  <Can
                    action="dataModelRecordsRead"
                    fallback={
                      <p className="text-sm text-muted-foreground">
                        You do not have permission to read custom model records.
                      </p>
                    }
                  >
                    <DataModelRecords model={model} />
                  </Can>
                </Tabs.Content>
              )}
            </div>
          </ScrollArea>
        </Tabs>
      )}
      {lifecycle && custom && (
        <DataModelLifecycle
          model={lifecycle}
          onClose={() => setLifecycle(null)}
        />
      )}
      {creatingField && !model.archivedAt && (
        <DataModelFieldForm
          model={model}
          onClose={() => setCreatingField(false)}
        />
      )}
    </PageContainer>
  );
};

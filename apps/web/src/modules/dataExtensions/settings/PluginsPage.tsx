import type { DataExtensionPlugin } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { IconAlertTriangle, IconColumns, IconPlug } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Badge,
  Button,
  buttonVariants,
  Empty,
  IconComponent,
  PageContainer,
  ScrollArea,
  Spinner,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { QueryState } from '~/components/QueryState';
import { paths } from '~/lib/paths';
import { useRefreshDataModel } from '../dataQueries';
import { useDataErrorToast } from '../useDataErrors';
import { DataModelHeader } from './DataModelHeader';

type PluginObject = DataExtensionPlugin['objects'][number];

/** One of the plugin's record types: its fields' page once connected, and why its own fields can't be read. */
const PluginObjectRow = ({ object, connected }: { object: PluginObject; connected: boolean }) => {
  const { t } = useTranslation('data', { keyPrefix: 'plugins' });

  return (
    <li className="flex items-start gap-3 px-3 py-2">
      <span className="mt-0.5 text-muted-foreground">
        {object.icon ? (
          <IconComponent name={object.icon} className="size-4" />
        ) : (
          <IconColumns className="size-4" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm">
          {object.label} <span className="text-xs text-muted-foreground">{object.type}</span>
        </p>
        <p className="text-xs text-muted-foreground">
          {t('own-fields', '{{count}} own fields for formulas', {
            count: object.nativeFields.length,
          })}
        </p>
        {object.problem && (
          <p className="flex items-center gap-1 text-xs text-destructive-text">
            <IconAlertTriangle className="size-3.5" />
            {object.problem}
          </p>
        )}
      </div>
      {connected && (
        <Link
          to={paths.settings.dataFieldsOf(object.type)}
          className={buttonVariants({ variant: 'ghost', size: 'sm' })}
        >
          {t('fields', 'Fields')}
        </Link>
      )}
    </li>
  );
};

const PluginCard = ({ plugin }: { plugin: DataExtensionPlugin }) => {
  const { t } = useTranslation('data', { keyPrefix: 'plugins' });
  const refresh = useRefreshDataModel();
  const failed = useDataErrorToast();
  const handlers = { onSuccess: () => void refresh(), onError: (error: Error) => failed(error) };
  const connect = useMutation(orpc.dataPlugins.connect.mutationOptions(handlers));
  const disconnect = useMutation(orpc.dataPlugins.disconnect.mutationOptions(handlers));
  const pending = connect.isPending || disconnect.isPending;
  const input = { plugin: plugin.plugin };

  return (
    <li className="rounded-lg border">
      <div className="flex items-center gap-3 p-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{plugin.title}</span>
            {plugin.connected ? (
              <Badge variant="success">{t('connected', 'Connected')}</Badge>
            ) : (
              <Badge variant="secondary">{t('not-connected', 'Not connected')}</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {t('field-count', '{{count}} fields added', { count: plugin.fieldCount })}
          </p>
        </div>
        <Button
          variant={plugin.connected ? 'outline' : 'default'}
          disabled={pending}
          onClick={() => (plugin.connected ? disconnect.mutate(input) : connect.mutate(input))}
        >
          {pending && <Spinner size="sm" />}
          {plugin.connected ? t('disconnect', 'Disconnect') : t('connect', 'Connect')}
        </Button>
      </div>
      <ul className="divide-y border-t">
        {plugin.objects.map((object) => (
          <PluginObjectRow key={object.type} object={object} connected={plugin.connected} />
        ))}
      </ul>
    </li>
  );
};

/** Settings › Data model › Connected plugins: plugins whose record types can take fields. */
export const PluginsPage = () => {
  const { t } = useTranslation('data', { keyPrefix: 'plugins' });
  const plugins = useQuery(orpc.dataPlugins.list.queryOptions());

  return (
    <PageContainer>
      <DataModelHeader
        crumbs={[{ label: t('title', 'Connected plugins'), to: paths.settings.dataPlugins }]}
      />
      <ScrollArea className="flex-1">
        <div className="mx-auto flex max-w-4xl flex-col gap-3 p-6">
          <p className="text-sm text-muted-foreground">
            {t(
              'intro',
              'Connect a plugin to add fields to its records and use its own fields in formulas and rollups. Disconnecting needs its fields archived first.',
            )}
          </p>
          <QueryState
            query={plugins}
            isEmpty={({ data }) => !data.length}
            empty={
              <Empty>
                <Empty.Header>
                  <Empty.Media variant="icon">
                    <IconPlug />
                  </Empty.Media>
                  <Empty.Title>{t('empty', 'No plugins to connect')}</Empty.Title>
                  <Empty.Description>
                    {t(
                      'empty-description',
                      'No installed plugin declares record types that take fields.',
                    )}
                  </Empty.Description>
                </Empty.Header>
              </Empty>
            }
          >
            {({ data }) => (
              <ul className="flex flex-col gap-3">
                {data.map((plugin) => (
                  <PluginCard key={plugin.plugin} plugin={plugin} />
                ))}
              </ul>
            )}
          </QueryState>
        </div>
      </ScrollArea>
    </PageContainer>
  );
};

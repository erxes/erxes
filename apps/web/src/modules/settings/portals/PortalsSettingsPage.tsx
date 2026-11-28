import type { PortalListItem } from '@erxes/core-contract';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { IconPlus, IconWorldWww } from '@tabler/icons-react';
import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AppBreadcrumb,
  Badge,
  Button,
  Dialog,
  Empty,
  Input,
  Label,
  PageContainer,
  PageHeader,
  ScrollArea,
  useToast,
} from 'erxes-ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { QueryState } from '~/components/QueryState';
import { paths } from '~/lib/paths';
import { useCan } from '~/modules/auth/session';
import { pluginTitle, useInstalledPlugins } from '~/modules/products/useCatalogContext';

const NoPortals = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'portals' });

  return (
    <Empty>
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconWorldWww />
        </Empty.Media>
        <Empty.Title>{t('empty', 'No portals yet')}</Empty.Title>
        <Empty.Description>
          {t(
            'empty-description',
            'Add one for each shop, hotel or tour site customers sign in to, with its mobile apps. Plugins put their store or site on it.',
          )}
        </Empty.Description>
      </Empty.Header>
    </Empty>
  );
};

/** One portal: its plugins, where it runs and how many customers have an account on it. */
const PortalRow = ({ portal }: { portal: PortalListItem }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'portals' });
  const { plugins } = useInstalledPlugins();
  const apps = portal.iosBundleIds.length + portal.androidPackages.length;

  return (
    <Link
      to={paths.settings.portalOf(portal.id)}
      className="block space-y-2 rounded-lg border bg-background p-4 hover:bg-accent"
    >
      <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-medium">{portal.name}</span>
        <span className="text-sm text-muted-foreground">
          {portal.plugins.length
            ? portal.plugins.map((plugin) => pluginTitle(plugins, plugin)).join(', ')
            : t('no-plugins', 'No plugins yet')}
        </span>
        <span className="ml-auto text-sm text-muted-foreground">
          {t('accounts', '{{count}} accounts', { count: portal.accounts })}
        </span>
      </span>
      <span className="flex flex-wrap gap-1">
        {portal.origins.map((origin) => (
          <Badge key={origin} variant="secondary">
            {origin}
          </Badge>
        ))}
        {apps > 0 && (
          <Badge variant="secondary">{t('apps', '{{count}} apps', { count: apps })}</Badge>
        )}
      </span>
    </Link>
  );
};

/** A new portal by its name; the rest is set on its page. */
const NewPortal = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'portals' });
  const { toast } = useToast();
  const client = useQueryClient();
  const navigate = useNavigate();
  const nameId = useId();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');

  const create = useMutation(
    orpc.portals.create.mutationOptions({
      onSuccess: (portal) => {
        void client.invalidateQueries({ queryKey: orpc.portals.list.key() });
        void navigate(paths.settings.portalOf(portal.id));
      },
      onError: (failure) =>
        toast({
          variant: 'destructive',
          title: t('create-failed', 'Could not add the portal'),
          description: messageOf(failure),
        }),
    }),
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger render={<Button />}>
        <IconPlus />
        {t('add', 'Add portal')}
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.HeaderCombined
          title={t('add', 'Add portal')}
          description={t(
            'add-description',
            'A shop, hotel or tour site with its apps. Customers sign up on it on their own.',
          )}
        />
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            create.mutate({ name });
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor={nameId}>{t('name', 'Name')}</Label>
            <Input
              id={nameId}
              value={name}
              maxLength={200}
              placeholder={t('name-placeholder', 'Acme Shop')}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={!name.trim() || create.isPending}>
            {t('add', 'Add portal')}
          </Button>
        </form>
      </Dialog.Content>
    </Dialog>
  );
};

/** Settings › Portals: where customers sign in, each with its own accounts (decision 42). */
export const PortalsSettingsPage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'portals' });
  const can = useCan();

  const portals = useQuery(
    orpc.portals.list.queryOptions({ input: can('contacts.view') ? undefined : skipToken }),
  );

  if (!can('contacts.view')) return <Navigate to={paths.settings.root} replace />;

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[
              { label: t('title', 'Portals'), to: paths.settings.portals, icon: IconWorldWww },
            ]}
          />
        </PageHeader.Start>
        <PageHeader.End>{can('portals.manage') && <NewPortal />}</PageHeader.End>
      </PageHeader>
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-4xl space-y-3 p-6">
          <p className="text-sm text-muted-foreground">
            {t(
              'intro',
              'A portal is where customers sign in: a website and its iOS and Android apps. Every plugin on it shares one sign-in, and each portal has its own accounts.',
            )}
          </p>
          <QueryState
            query={portals}
            className="py-12"
            isEmpty={({ data }) => !data.length}
            empty={<NoPortals />}
          >
            {({ data }) => (
              <div className="space-y-2">
                {data.map((portal) => (
                  <PortalRow key={portal.id} portal={portal} />
                ))}
              </div>
            )}
          </QueryState>
        </div>
      </ScrollArea>
    </PageContainer>
  );
};

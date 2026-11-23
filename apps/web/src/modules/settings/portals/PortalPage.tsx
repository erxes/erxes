import type { PortalListItem } from '@erxes/core-contract';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { IconTrash, IconWorldWww } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AppBreadcrumb,
  Button,
  Form,
  Input,
  PageContainer,
  PageHeader,
  ScrollArea,
  Spinner,
  Tabs,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { QueryState } from '~/components/QueryState';
import { paths } from '~/lib/paths';
import { useCan } from '~/modules/auth/session';
import { pluginTitle, useInstalledPlugins } from '~/modules/products/useCatalogContext';
import { AddressList } from './AddressList';
import { PortalKeys } from './PortalKeys';
import { PortalSignInForm } from './PortalSignInForm';
import { useSavePortal } from './useSavePortal';

/** Where a portal runs: its web addresses, iOS apps and Android apps. */
const usePlatforms = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'portals' });

  return [
    {
      column: 'origins',
      title: t('web', 'Web'),
      description: t(
        'web-description',
        'The addresses its pages run at. Browsers may sign customers in from these only.',
      ),
      placeholder: 'https://shop.example.mn',
    },
    {
      column: 'iosBundleIds',
      title: t('ios', 'iOS apps'),
      description: t('ios-description', 'Bundle ids. Sign in with Apple accepts tokens for them.'),
      placeholder: 'mn.acme.shop',
    },
    {
      column: 'androidPackages',
      title: t('android', 'Android apps'),
      description: t('android-description', 'Package names.'),
      placeholder: 'mn.acme.shop',
    },
  ] as const;
};

/** Its name, the name its emails come from, and where it runs: web addresses and apps. */
const Setup = ({ portal, canEdit }: { portal: PortalListItem; canEdit: boolean }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'portals' });
  const save = useSavePortal();
  const platforms = usePlatforms();

  const [draft, setDraft] = useState(() => ({
    name: portal.name,
    senderName: portal.senderName ?? '',
    origins: portal.origins,
    iosBundleIds: portal.iosBundleIds,
    androidPackages: portal.androidPackages,
  }));

  return (
    <div className="space-y-4">
      <Form.Section title={t('name', 'Name')}>
        <Input
          aria-label={t('name', 'Name')}
          value={draft.name}
          maxLength={200}
          disabled={!canEdit}
          onChange={(event) => setDraft({ ...draft, name: event.target.value })}
        />
      </Form.Section>
      <Form.Section
        title={t('sender-name', 'Sender name')}
        description={t(
          'sender-name-description',
          'Its codes and notifications come from this name. Empty: the portal’s name.',
        )}
      >
        <Input
          aria-label={t('sender-name', 'Sender name')}
          value={draft.senderName}
          maxLength={100}
          disabled={!canEdit}
          placeholder={draft.name}
          onChange={(event) => setDraft({ ...draft, senderName: event.target.value })}
        />
      </Form.Section>
      {platforms.map(({ column, title, description, placeholder }) => (
        <Form.Section key={column} title={title} description={description}>
          <AddressList
            label={title}
            placeholder={placeholder}
            values={draft[column]}
            disabled={!canEdit}
            onChange={(values) => setDraft({ ...draft, [column]: values })}
          />
        </Form.Section>
      ))}
      {canEdit && (
        <div className="flex justify-end">
          <Button
            disabled={save.isPending || !draft.name.trim()}
            onClick={() =>
              save.mutate({
                id: portal.id,
                ...draft,
                senderName: draft.senderName.trim() || null,
              })
            }
          >
            {save.isPending && <Spinner size="sm" />}
            {t('save', 'Save')}
          </Button>
        </div>
      )}
    </div>
  );
};

/** The plugins on the portal; each puts its record (a store, a site) on it in its own settings. */
const Plugins = ({ portal }: { portal: PortalListItem }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'portals' });
  const { plugins } = useInstalledPlugins();

  return (
    <div className="space-y-3 text-sm">
      <p className="text-muted-foreground">
        {t(
          'plugins-intro',
          'Each plugin puts its store, site or channel on a portal in its own settings. Customers sign in once for all of them. The portal signs customers in while one of them is installed.',
        )}
      </p>
      {portal.plugins.length ? (
        <ul className="space-y-2">
          {portal.plugins.map((plugin) => (
            <li key={plugin} className="rounded-md border px-3 py-2 font-medium">
              {pluginTitle(plugins, plugin)}
            </li>
          ))}
        </ul>
      ) : (
        <p>{t('no-plugins', 'No plugins yet')}</p>
      )}
      <p className="text-muted-foreground">
        {t('portal-id', 'Its id, for sign-in calls: {{id}}', { id: portal.id })}
      </p>
    </div>
  );
};

const RemovePortal = ({ portal }: { portal: PortalListItem }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'portals' });
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const client = useQueryClient();
  const navigate = useNavigate();

  const remove = useMutation(
    orpc.portals.remove.mutationOptions({
      onSuccess: () => {
        void client.invalidateQueries({ queryKey: orpc.portals.key() });
        void navigate(paths.settings.portals);
      },
      onError: (failure) =>
        toast({
          variant: 'destructive',
          title: t('failed', 'Not saved'),
          description: messageOf(failure),
        }),
    }),
  );

  return (
    <Button
      variant="ghost"
      tone="destructive"
      disabled={remove.isPending}
      onClick={() =>
        void confirm({
          message: t(
            'remove-confirm',
            'Delete “{{name}}” with its {{count}} customer accounts? The customers stay in Contacts.',
            { name: portal.name, count: portal.accounts },
          ),
        }).then(() => remove.mutate({ id: portal.id }))
      }
    >
      <IconTrash />
      {t('remove', 'Delete portal')}
    </Button>
  );
};

/** Settings › Portals › one portal: where it runs, how customers sign in, its keys and plugins. */
export const PortalPage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'portals' });
  const { id = '' } = useParams();
  const can = useCan();
  const canEdit = can('portals.manage');
  const portal = useQuery(orpc.portals.get.queryOptions({ input: { id } }));

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[
              { label: t('title', 'Portals'), to: paths.settings.portals, icon: IconWorldWww },
              { label: portal.data?.name ?? '…', to: paths.settings.portalOf(id) },
            ]}
          />
        </PageHeader.Start>
        <PageHeader.End>
          {canEdit && portal.data && <RemovePortal portal={portal.data} />}
        </PageHeader.End>
      </PageHeader>
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-4xl p-6">
          <QueryState query={portal} className="py-12">
            {(saved) => (
              <Tabs defaultValue="setup">
                <Tabs.List variant="underline" className="mb-4">
                  <Tabs.Trigger value="setup">{t('tab-setup', 'Setup')}</Tabs.Trigger>
                  <Tabs.Trigger value="sign-in">{t('tab-sign-in', 'Sign-in')}</Tabs.Trigger>
                  {canEdit && (
                    <Tabs.Trigger value="keys">{t('tab-keys', 'Server keys')}</Tabs.Trigger>
                  )}
                  <Tabs.Trigger value="plugins">{t('tab-plugins', 'Plugins')}</Tabs.Trigger>
                </Tabs.List>
                <Tabs.Content value="setup">
                  <Setup key={saved.updatedAt} portal={saved} canEdit={canEdit} />
                </Tabs.Content>
                <Tabs.Content value="sign-in">
                  <PortalSignInForm key={saved.updatedAt} portal={saved} canEdit={canEdit} />
                </Tabs.Content>
                {canEdit && (
                  <Tabs.Content value="keys">
                    <PortalKeys portalId={saved.id} />
                  </Tabs.Content>
                )}
                <Tabs.Content value="plugins">
                  <Plugins portal={saved} />
                </Tabs.Content>
              </Tabs>
            )}
          </QueryState>
        </div>
      </ScrollArea>
    </PageContainer>
  );
};

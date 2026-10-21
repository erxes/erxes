import { IconSandbox } from '@tabler/icons-react';
import { NavigationMenuLinkItem, recordTableCursorAtomFamily } from 'erxes-ui';
import { useStore } from 'jotai';
import { useTranslation } from 'react-i18next';
import { PluginNavigationItem } from 'ui-modules';
import { PUT_RESPONSE_ROUTES } from '@/ebarimt/put-response/components/PutResponseRoutes';
import { SYNC_ERKHET_ROUTES } from '@/erkhet-sync/components/SyncErkhetRoutes';

type TCursorRoute = { label: string; value: string; sessionKey: string };

export const MainNavigation = () => {
  const { t } = useTranslation('mongolian');
  const store = useStore();

  const subPaths = (pathPrefix: string, routes: TCursorRoute[]) =>
    routes.map(({ label, value, sessionKey }) => ({
      name: t(label),
      path: `/${pathPrefix}/${value}`,
      onClick: () => store.set(recordTableCursorAtomFamily(sessionKey), ''),
    }));

  return (
    <>
      <PluginNavigationItem
        name={t('put-response')}
        pathPrefix="mongolian"
        path="put-response"
        icon={IconSandbox}
        subPaths={subPaths('mongolian/put-response', PUT_RESPONSE_ROUTES)}
      />
      <PluginNavigationItem
        name={t('erkhet-sync')}
        pathPrefix="mongolian"
        path="sync-erkhet"
        icon={IconSandbox}
        subPaths={subPaths('mongolian/sync-erkhet', SYNC_ERKHET_ROUTES)}
      />
      <NavigationMenuLinkItem
        name={t('ms-dynamic')}
        path="mongolian/msdynamic"
        icon={IconSandbox}
      />
    </>
  );
};

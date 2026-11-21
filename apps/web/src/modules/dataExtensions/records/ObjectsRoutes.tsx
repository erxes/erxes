import { IconBox, IconSettings } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import {
  AppLayout,
  AppLayoutFooterLink,
  Empty,
  IconsProvider,
  NavigationMenuLinkItem,
  Sidebar,
  Skeleton,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes } from 'react-router-dom';
import { PageOutlet } from '~/components/CrashBoundary';
import { QueryState } from '~/components/QueryState';
import { paths } from '~/lib/paths';
import { useCanManageDataModel, objectsQuery } from '../dataQueries';
import { ObjectRecordsPage } from './ObjectRecordsPage';
import { RecordPage } from './RecordPage';

/** A link per active object, as the app's sidebar. */
const ObjectLinks = () => {
  const objects = useQuery(objectsQuery());

  return (
    <Sidebar.Group variant="flush">
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          <QueryState query={objects} loading={<Skeleton className="m-2 h-5" />}>
            {({ data }) =>
              data.map((object) => (
                <NavigationMenuLinkItem
                  key={object.id}
                  to={paths.objects.list(object.key)}
                  name={object.pluralLabel}
                  icon={IconBox}
                />
              ))
            }
          </QueryState>
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};

/** The Objects app: each active custom object in the sidebar, settings at its foot. */
const ObjectsLayout = () => {
  const { t } = useTranslation('data', { keyPrefix: 'records' });
  const { t: sidebarT } = useTranslation('common', { keyPrefix: 'sidebar' });
  const manage = useCanManageDataModel();

  return (
    <AppLayout
      id="objects"
      title={t('app', 'Objects')}
      footer={
        manage ? (
          <AppLayoutFooterLink
            to={paths.settings.dataObjects}
            name={sidebarT('settings', 'Settings')}
            icon={IconSettings}
          />
        ) : undefined
      }
      sidebar={<ObjectLinks />}
    >
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <PageOutlet />
      </div>
    </AppLayout>
  );
};

/** `/objects`: the first object's records, or what objects are for. */
const ObjectsIndex = () => {
  const { t } = useTranslation('data', { keyPrefix: 'records' });
  const objects = useQuery(objectsQuery());

  return (
    <QueryState
      query={objects}
      className="py-12"
      isEmpty={({ data }) => !data.length}
      empty={
        <Empty className="absolute inset-x-0 top-1/4">
          <Empty.Header>
            <Empty.Media variant="icon">
              <IconBox />
            </Empty.Media>
            <Empty.Title>{t('no-objects', 'No objects yet')}</Empty.Title>
            <Empty.Description>
              {t(
                'no-objects-description',
                'Objects are record types of your own. Add one in Settings › Data model.',
              )}
            </Empty.Description>
          </Empty.Header>
        </Empty>
      }
    >
      {({ data }) => (data[0] ? <Navigate to={paths.objects.list(data[0].key)} replace /> : null)}
    </QueryState>
  );
};

/** Every Objects route, mounted at `objects/*`: an object's records and each record's page. */
export const ObjectsRoutes = () => (
  <IconsProvider>
    <Routes>
      <Route element={<ObjectsLayout />}>
        <Route index element={<ObjectsIndex />} />
        <Route path=":objectKey" element={<ObjectRecordsPage />} />
        <Route path=":objectKey/:id" element={<RecordPage />} />
      </Route>
    </Routes>
  </IconsProvider>
);

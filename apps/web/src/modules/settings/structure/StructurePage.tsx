import { messageOf, orpc } from '@erxes/core-contract/client';
import { IconHierarchy2, IconPlus } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Button, DisplayMenu, PageContainer, PageHeader, Spinner } from 'erxes-ui';
import { type ReactNode, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { QueryState } from '~/components/QueryState';
import { lazyNamed } from '~/lib/lazyNamed';
import { paths } from '~/lib/paths';
import { useCan } from '~/modules/auth/session';
import {
  STRUCTURE_DISPLAY_LIST,
  useSelectedUnit,
  useStructureDisplays,
  useWorkspace,
  WorkspaceProvider,
} from './context';
import { OrgList } from './OrgList';
import { OrgSearch } from './OrgSearch';
import { PageMenu } from './PageMenu';
import { UnitPanel } from './UnitPanel';
import { useUnitTree } from './useUnitTree';

const OrgChart = lazyNamed(() => import('./OrgChart'), 'OrgChart');

/**
 * Floating top left: search, then add under the selected unit, else under the organisation.
 * On a phone the search takes the row's width, so the two stay on one line above the tree.
 */
const Toolbar = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { selectedId, index, startDraft, canManage } = useWorkspace();
  const selected = selectedId ? index.byId.get(selectedId) : undefined;
  const parent = selected?.isActive ? selected : index.root;

  return (
    <div className="absolute top-3 right-3 left-3 z-10 flex items-start gap-2 sm:right-auto">
      <OrgSearch />
      {canManage && (
        <Button className="shrink-0" onClick={() => startDraft(parent)}>
          <IconPlus />
          {parent === index.root ? t('add-unit', 'Add unit') : t('add-subunit', 'Add subunit')}
        </Button>
      )}
    </div>
  );
};

/** A page of subunits that failed to load, with a retry. */
const LoadFailed = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { failed, retry } = useWorkspace();

  if (!failed) return null;

  return (
    <div
      role="alert"
      className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm shadow-lg"
    >
      <span className="text-destructive-text">{messageOf(failed)}</span>
      <Button variant="outline" size="sm" onClick={retry}>
        {t('retry', 'Try again')}
      </Button>
    </div>
  );
};

const Header = ({ children }: { children?: ReactNode }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const displays = useStructureDisplays();

  return (
    <PageHeader>
      <PageHeader.Start>
        <AppBreadcrumb
          items={[
            { label: t('title', 'Structure'), to: paths.settings.structure, icon: IconHierarchy2 },
          ]}
        />
      </PageHeader.Start>
      <PageHeader.End>
        <DisplayMenu list={STRUCTURE_DISPLAY_LIST} displays={displays} />
        {children}
      </PageHeader.End>
    </PageHeader>
  );
};

const Workspace = () => {
  const { view, selectedId } = useWorkspace();

  return (
    <div className="relative flex min-h-0 flex-1 overflow-hidden">
      {view === 'list' ? (
        <OrgList />
      ) : (
        <Suspense fallback={<Spinner area="lg" />}>
          <OrgChart />
        </Suspense>
      )}
      <Toolbar />
      <LoadFailed />
      {selectedId && <UnitPanel unitId={selectedId} />}
    </div>
  );
};

/**
 * Settings › Structure: the organisation as one tree, its own unit at the top, as a chart or an
 * indented list. Units load as they are opened, so a structure of thousands stays quick. Search
 * finds units and people, units are added in place, and the selected unit opens beside the tree.
 */
export const StructurePage = () => {
  const can = useCan();
  const [selectedId] = useSelectedUnit();
  const tree = useUnitTree(selectedId);
  const types = useQuery(orpc.unitTypes.list.queryOptions({ input: {} }));
  const { index } = tree;

  if (!index || !types.data)
    return (
      <PageContainer>
        <Header />
        <QueryState query={tree.rootQuery} className="flex-1">
          {() => (
            <QueryState query={types} className="flex-1">
              {() => null}
            </QueryState>
          )}
        </QueryState>
      </PageContainer>
    );

  return (
    <PageContainer>
      <WorkspaceProvider
        tree={tree}
        index={index}
        types={types.data.data}
        canManage={can('structure.manage')}
        canSeeTeam={can('team.view')}
      >
        <Header>
          <PageMenu />
        </Header>
        <Workspace />
      </WorkspaceProvider>
    </PageContainer>
  );
};

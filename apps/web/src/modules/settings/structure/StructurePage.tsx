import { messageOf, orpc } from '@erxes/core-contract/client';
import { IconHierarchy2, IconPlus } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  DisplayMenu,
  PageContainer,
  PageHeader,
  PageSubHeader,
  Resizable,
  Spinner,
  useMediaQuery,
} from 'erxes-ui';
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

/** Too narrow for the tree and a unit side by side: the unit covers the tree. */
const NARROW = '(max-width: 1023px)';

/** Adds under the selected unit, else under the organisation. */
const AddUnit = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { selectedId, index, startDraft, canManage } = useWorkspace();
  const selected = selectedId ? index.byId.get(selectedId) : undefined;
  const parent = selected?.isActive ? selected : index.root;

  if (!canManage) return null;

  return (
    <Button onClick={() => startDraft(parent)}>
      <IconPlus />
      {parent === index.root ? t('add-unit', 'Add unit') : t('add-subunit', 'Add subunit')}
    </Button>
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

/** Search on the left; how big the organisation is on the right. */
const SearchBar = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { index } = useWorkspace();

  return (
    <PageSubHeader className="items-center">
      <OrgSearch />
      <span className="ml-auto hidden text-xs text-muted-foreground tabular-nums sm:block">
        {t('people-in-all', 'People in the organisation: {{count}}', {
          count: index.root.subtreeMemberCount,
        })}
      </span>
    </PageSubHeader>
  );
};

/** The tree or the chart, with the selected unit beside it in a column that drags wider. */
const Workspace = () => {
  const { view, selectedId } = useWorkspace();
  const narrow = useMediaQuery(NARROW);

  return (
    <div className="relative flex min-h-0 flex-1">
      <Resizable.PanelGroup>
        <Resizable.Panel id="structure-tree" minSize={280}>
          <div className="relative size-full">
            {view === 'list' ? (
              <OrgList />
            ) : (
              <Suspense fallback={<Spinner area="lg" />}>
                <OrgChart />
              </Suspense>
            )}
            <LoadFailed />
          </div>
        </Resizable.Panel>
        {selectedId && !narrow && (
          <>
            <Resizable.Handle />
            <Resizable.Panel
              id="structure-unit"
              defaultSize={440}
              minSize={340}
              maxSize={680}
              groupResizeBehavior="preserve-pixel-size"
            >
              <UnitPanel unitId={selectedId} />
            </Resizable.Panel>
          </>
        )}
      </Resizable.PanelGroup>
      {selectedId && narrow && (
        <div className="absolute inset-0 z-20">
          <UnitPanel unitId={selectedId} />
        </div>
      )}
    </div>
  );
};

/**
 * Settings › Structure: the organisation as one tree, its own unit at the top, as a tree with
 * columns or a chart. Units load as they are opened, so a structure of thousands stays quick.
 * Search finds units and people, units are added in place, and the selected unit opens beside
 * the tree.
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
          <AddUnit />
        </Header>
        <SearchBar />
        <Workspace />
      </WorkspaceProvider>
    </PageContainer>
  );
};

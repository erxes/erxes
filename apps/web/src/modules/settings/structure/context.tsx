import type { UnitNode, UnitType } from '@erxes/core-contract';
import { IconHierarchy2, IconListTree } from '@tabler/icons-react';
import { useListDisplay } from 'erxes-ui';
import { createContext, type ReactNode, use, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TreeIndex } from './unitTree';
import { useSelection } from './useSelection';
import type { UnitTree } from './useUnitTree';

/** Where the structure's view is kept. */
export const STRUCTURE_DISPLAY_LIST = 'core-structure';

/** The tree with its columns, then the chart, for the page's view switch. */
export const useStructureDisplays = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });

  return [
    { key: 'list', label: t('view-tree', 'Tree'), icon: IconListTree },
    { key: 'chart', label: t('view-chart', 'Chart'), icon: IconHierarchy2 },
  ] as const;
};

type Workspace = Omit<UnitTree, 'index'> &
  ReturnType<typeof useSelection> & {
    index: TreeIndex;
    types: UnitType[];
    typesById: Map<string, UnitType>;
    view: 'chart' | 'list';
    /** The unit a new one is being added under, in place. */
    draftParentId: string | null;
    startDraft: (parent: UnitNode) => void;
    closeDraft: () => void;
    /** Whether a unit's frame on the chart shows everyone in it, not the first few. */
    showsAllPeople: (unitId: string) => boolean;
    toggleAllPeople: (unitId: string) => void;
    /** Bumps when the chart should fit the screen. */
    fitRequest: number;
    requestFit: () => void;
    canManage: boolean;
    /** The member may list the team, so names and the people search show. */
    canSeeTeam: boolean;
  };

const WorkspaceContext = createContext<Workspace | null>(null);

export const useWorkspace = () => {
  const workspace = use(WorkspaceContext);

  if (!workspace) throw new Error('useWorkspace is used outside WorkspaceProvider');

  return workspace;
};

/**
 * The tree's and the chart's shared state: what is open and loaded, the selected unit, the units
 * picked together, the unit being added in place, and the view picked in the page's view switch.
 */
export const WorkspaceProvider = ({
  tree,
  index,
  types,
  canManage,
  canSeeTeam,
  children,
}: {
  tree: UnitTree;
  index: TreeIndex;
  types: UnitType[];
  canManage: boolean;
  canSeeTeam: boolean;
  children: ReactNode;
}) => {
  const [display] = useListDisplay(STRUCTURE_DISPLAY_LIST, useStructureDisplays());
  const selection = useSelection({ index, tree, canPick: canManage, ranges: display !== 'chart' });
  const [draftParentId, setDraftParentId] = useState<string | null>(null);
  const [allPeople, setAllPeople] = useState(new Set<string>());
  const [fitRequest, setFitRequest] = useState(0);

  const workspace = useMemo(
    (): Workspace => ({
      ...tree,
      ...selection,
      index,
      types,
      typesById: new Map(types.map((type) => [type.id, type])),
      isOpen: (unit) => unit.id === draftParentId || tree.isOpen(unit),
      view: display === 'chart' ? 'chart' : 'list',
      draftParentId,
      startDraft: (parent) => {
        tree.setOpen(parent, true);
        setDraftParentId(parent.id);
      },
      closeDraft: () => setDraftParentId(null),
      showsAllPeople: (unitId) => allPeople.has(unitId),
      toggleAllPeople: (unitId) => {
        const next = new Set(allPeople);

        if (!next.delete(unitId)) next.add(unitId);

        setAllPeople(next);
      },
      fitRequest,
      requestFit: () => setFitRequest((count) => count + 1),
      canManage,
      canSeeTeam,
    }),
    [
      tree,
      selection,
      index,
      types,
      display,
      draftParentId,
      allPeople,
      fitRequest,
      canManage,
      canSeeTeam,
    ],
  );

  return <WorkspaceContext value={workspace}>{children}</WorkspaceContext>;
};

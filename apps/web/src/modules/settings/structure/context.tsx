import type { UnitNode, UnitType } from '@erxes/core-contract';
import { IconHierarchy2, IconListTree } from '@tabler/icons-react';
import { useListDisplay } from 'erxes-ui';
import { useQueryState } from 'nuqs';
import { createContext, type ReactNode, use, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TreeIndex } from './unitTree';
import type { UnitTree } from './useUnitTree';

/** Where the Display menu keeps the structure's view. */
export const STRUCTURE_DISPLAY_LIST = 'core-structure';

/** The chart, then the indented list, for the Display menu. */
export const useStructureDisplays = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });

  return [
    { key: 'chart', label: t('view-chart', 'Chart'), icon: IconHierarchy2 },
    { key: 'list', label: t('view-list', 'List'), icon: IconListTree },
  ] as const;
};

type Workspace = Omit<UnitTree, 'index'> & {
  index: TreeIndex;
  types: UnitType[];
  typesById: Map<string, UnitType>;
  view: 'chart' | 'list';
  selectedId: string | null;
  /** Selects a unit (null: none); `reveal` also opens the units above it and brings it in sight. */
  select: (id: string | null, reveal?: Pick<UnitNode, 'id' | 'path'>) => void;
  /** The unit to bring in sight once it is drawn. */
  focusId: string | null;
  clearFocus: () => void;
  /** The unit a new one is being added under, in place. */
  draftParentId: string | null;
  startDraft: (parent: UnitNode) => void;
  closeDraft: () => void;
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

/** The selected unit (`?unit=`), kept in the address so a link opens the page on it. */
export const useSelectedUnit = () => useQueryState('unit', { history: 'replace' });

/**
 * The chart's and the list's shared state: what is open and loaded, the selected unit, the unit
 * being added in place, and the view picked in the Display menu.
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
  const [selectedId, setSelectedId] = useSelectedUnit();
  const [focusId, setFocusId] = useState<string | null>(selectedId);
  const [draftParentId, setDraftParentId] = useState<string | null>(null);
  const [fitRequest, setFitRequest] = useState(0);

  const workspace = useMemo(
    (): Workspace => ({
      ...tree,
      index,
      types,
      typesById: new Map(types.map((type) => [type.id, type])),
      isOpen: (unit) => unit.id === draftParentId || tree.isOpen(unit),
      view: display === 'list' ? 'list' : 'chart',
      selectedId,
      select: (id, reveal) => {
        void setSelectedId(id);

        if (reveal) {
          tree.openAbove(reveal);
          setFocusId(reveal.id);
        }
      },
      focusId,
      clearFocus: () => setFocusId(null),
      draftParentId,
      startDraft: (parent) => {
        tree.setOpen(parent, true);
        setDraftParentId(parent.id);
      },
      closeDraft: () => setDraftParentId(null),
      fitRequest,
      requestFit: () => setFitRequest((count) => count + 1),
      canManage,
      canSeeTeam,
    }),
    [
      tree,
      index,
      types,
      display,
      selectedId,
      setSelectedId,
      focusId,
      draftParentId,
      fitRequest,
      canManage,
      canSeeTeam,
    ],
  );

  return <WorkspaceContext value={workspace}>{children}</WorkspaceContext>;
};

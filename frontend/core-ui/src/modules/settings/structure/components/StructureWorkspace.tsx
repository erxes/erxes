import { useApolloClient } from '@apollo/client';
import { IconAlertTriangle, IconHierarchy } from '@tabler/icons-react';
import { Spinner } from 'erxes-ui';
import { useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { usePermissionCheck } from 'ui-modules';
import { useStructureRoot } from '@/structure-access';
import {
  STRUCTURE_MANAGE_ACTION,
  STRUCTURE_TYPES_MANAGE_ACTION,
} from '../constants/structureCapabilities';
import {
  StructureWorkspaceContext,
  TStructureWorkspaceContext,
} from '../contexts/StructureWorkspaceContext';
import { useStructureEntitySelection } from '../hooks/useStructureEntitySelection';
import { useStructureEntityTree } from '../hooks/useStructureEntityTree';
import { useStructureEntityTypesList } from '../hooks/useStructureEntityTypesList';
import { useStructureTreeExpansion } from '../hooks/useStructureTreeExpansion';
import { useStructureView } from '../hooks/useStructureView';
import {
  structureDraftParentState,
  structureFocusState,
  structureNodeTypesOpenState,
  structureShowArchivedState,
  structureTypeSettingsState,
} from '../states/structureViewState';
import { getStructureCanvasDraftId } from '../utils/structureCanvasLayout';
import { groupStructureTree } from '../utils/structureTree';
import { StructureCanvas } from './canvas/StructureCanvas';
import { StructureDndProvider } from './dnd/StructureDndProvider';
import { StructureDrawer } from './drawer/StructureDrawer';
import { StructureList } from './list/StructureList';
import { StructureActions } from './StructureActions';
import { StructureSearch } from './search/StructureSearch';
import { StructureEmpty } from './StructureEmpty';
import { StructureNodeTypesDialog } from './types/StructureNodeTypesDialog';
import { StructureTypeSettingsDialog } from './types/StructureTypeSettingsDialog';

const useStructureRootBootstrap = (loading: boolean, empty: boolean) => {
  const client = useApolloClient();
  const { root } = useStructureRoot({ skip: loading || !empty });
  const rootId = root?._id;

  useEffect(() => {
    if (rootId && empty) {
      client.refetchQueries({ include: ['StructureEntitiesTree'] });
    }
  }, [rootId, empty, client]);
};

const useStructureWorkspaceReset = () => {
  const setDraftParentId = useSetAtom(structureDraftParentState);
  const setFocusId = useSetAtom(structureFocusState);
  const setTypeSettings = useSetAtom(structureTypeSettingsState);
  const setNodeTypesOpen = useSetAtom(structureNodeTypesOpenState);

  useEffect(
    () => () => {
      setDraftParentId(null);
      setFocusId(null);
      setTypeSettings(null);
      setNodeTypesOpen(false);
    },
    [setDraftParentId, setFocusId, setTypeSettings, setNodeTypesOpen],
  );
};

export const StructureWorkspace = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { view } = useStructureView();
  const showArchived = useAtomValue(structureShowArchivedState);
  const setDraftParentId = useSetAtom(structureDraftParentState);
  const setFocusId = useSetAtom(structureFocusState);
  const { entities, loading, loadingMore, error } =
    useStructureEntityTree(showArchived);
  const { types, typesById } = useStructureEntityTypesList();
  const { entityId, setEntityId } = useStructureEntitySelection();
  const { hasActionPermission } = usePermissionCheck();
  const { entitiesById, childrenById } = useMemo(
    () => ({
      entitiesById: new Map(entities.map((entity) => [entity._id, entity])),
      childrenById: groupStructureTree(entities).childrenById,
    }),
    [entities],
  );
  const { isExpanded, toggle, expand } = useStructureTreeExpansion(
    entityId ? entitiesById.get(entityId) : undefined,
  );
  const initialFocusId = useRef(entityId);

  useStructureRootBootstrap(loading || !!error, !entities.length);
  useStructureWorkspaceReset();

  useEffect(() => {
    if (initialFocusId.current && entitiesById.has(initialFocusId.current)) {
      setFocusId(initialFocusId.current);
      initialFocusId.current = null;
    }
  }, [entitiesById, setFocusId]);

  const select = useCallback<TStructureWorkspaceContext['select']>(
    (id, options) => {
      setEntityId(id);

      if (options?.focus) {
        setFocusId(id);
      }
    },
    [setEntityId, setFocusId],
  );

  const startDraft = useCallback(
    (parentId: string) => {
      expand(parentId);
      setDraftParentId(parentId);
      setFocusId(getStructureCanvasDraftId(parentId));
    },
    [expand, setDraftParentId, setFocusId],
  );

  const context = useMemo<TStructureWorkspaceContext>(
    () => ({
      entities,
      entitiesById,
      childrenById,
      types,
      typesById,
      selectedId: entityId,
      select,
      isExpanded,
      toggle,
      expand,
      startDraft,
      canManage: hasActionPermission(STRUCTURE_MANAGE_ACTION),
      canManageTypes: hasActionPermission(STRUCTURE_TYPES_MANAGE_ACTION),
    }),
    [
      entities,
      entitiesById,
      childrenById,
      types,
      typesById,
      entityId,
      select,
      isExpanded,
      toggle,
      expand,
      startDraft,
      hasActionPermission,
    ],
  );

  const renderView = () => {
    if (loading) {
      return <Spinner containerClassName="flex-1" />;
    }

    if (error) {
      return (
        <StructureEmpty
          icon={IconAlertTriangle}
          title={t('tree-load-failed')}
          description={error.message}
          className="flex-1"
        />
      );
    }

    if (!entities.length) {
      return (
        <StructureEmpty
          icon={IconHierarchy}
          title={t('tree-empty')}
          className="flex-1"
        />
      );
    }

    return view === 'list' ? <StructureList /> : <StructureCanvas />;
  };

  return (
    <StructureWorkspaceContext.Provider value={context}>
      <StructureDndProvider>
        <div className="relative flex min-h-0 w-full flex-1 overflow-hidden">
          {renderView()}
          {!loading && !error && (
            <div className="absolute left-3 top-3 z-10 flex items-start gap-2">
              <StructureSearch />
              <StructureActions />
            </div>
          )}
          {loadingMore && (
            <span className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground shadow-sm">
              <Spinner size="sm" />
              {t('loading-more')}
            </span>
          )}
          {entityId && (
            <StructureDrawer
              entityId={entityId}
              onClose={() => setEntityId(null)}
            />
          )}
        </div>
      </StructureDndProvider>
      <StructureTypeSettingsDialog />
      <StructureNodeTypesDialog />
    </StructureWorkspaceContext.Provider>
  );
};

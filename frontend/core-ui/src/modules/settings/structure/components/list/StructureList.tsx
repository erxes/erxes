import { cn, ScrollArea } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { Fragment, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { STRUCTURE_CANVAS_NODE_HEIGHT } from '../../constants/structureCanvas';
import { useStructureWorkspace } from '../../contexts/StructureWorkspaceContext';
import { structureDraftParentState } from '../../states/structureViewState';
import { TStructureTreeEntity } from '../../types/structureEntity';
import { flattenStructureTree } from '../../utils/structureTree';
import { StructureDraftInput } from '../draft/StructureDraftInput';
import { STRUCTURE_LIST_INDENT, StructureListRow } from './StructureListRow';

export const StructureList = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { entities, isExpanded, selectedId } = useStructureWorkspace();
  const draftParentId = useAtomValue(structureDraftParentState);
  const isRowExpanded = useCallback(
    (entity: TStructureTreeEntity, depth: number) =>
      entity._id === draftParentId || isExpanded(entity, depth),
    [draftParentId, isExpanded],
  );
  const rows = useMemo(
    () => flattenStructureTree({ entities, isExpanded: isRowExpanded }),
    [entities, isRowExpanded],
  );

  return (
    <ScrollArea className="size-full">
      <div
        role="tree"
        aria-label={t('structure')}
        className={cn(
          'flex max-w-3xl flex-col gap-0.5 px-3 pb-3 pt-16',
          selectedId && 'mr-[28rem]',
        )}
      >
        {rows.map((row) => (
          <Fragment key={row.entity._id}>
            <StructureListRow {...row} />
            {row.entity._id === draftParentId && (
              <div
                className="max-w-sm py-1"
                style={{
                  paddingLeft: (row.depth + 1) * STRUCTURE_LIST_INDENT + 4,
                  height: STRUCTURE_CANVAS_NODE_HEIGHT,
                }}
              >
                <StructureDraftInput parentId={row.entity._id} />
              </div>
            )}
          </Fragment>
        ))}
      </div>
    </ScrollArea>
  );
};

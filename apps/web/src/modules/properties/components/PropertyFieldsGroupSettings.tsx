import type { FieldContentType } from '@erxes/core-contract';
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Spinner } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { messageOf } from '~/lib/api';
import { reorderItems } from '../reorder';
import { selectedFieldIdsState } from '../states';
import { groupFields, useAllFields, useFieldGroups } from '../useFields';
import { useReorder } from '../usePropertyMutations';
import { PropertiesArchivedSection } from './PropertiesArchivedSection';
import { PropertiesCommandBar } from './PropertiesCommandBar';
import { PropertiesGroupSection, PropertiesUngroupedSection } from './PropertiesGroupSection';
import { PropertyArchiveDialog } from './PropertyArchiveDialog';
import { PropertyGroupEditSheet } from './PropertyGroupEdit';
import { PropertyGroupLayoutSheet } from './PropertyGroupLayoutSheet';

/** A record type's properties: its groups (drag to reorder) with their fields, then Archived. */
export const PropertyFieldsGroupSettings = ({ contentType }: { contentType: FieldContentType }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const { groups, loading: groupsLoading, error: groupsError } = useFieldGroups(contentType);
  const { fields, loading: fieldsLoading, error: fieldsError } = useAllFields(contentType);
  const error = groupsError ?? fieldsError;
  const reorder = useReorder('groups', contentType);
  const setSelectedFieldIds = useSetAtom(selectedFieldIdsState);
  const sections = useMemo(() => groupFields(groups, fields), [groups, fields]);
  const ungrouped = sections.find((section) => !section.group)?.fields ?? [];
  const loading = groupsLoading || fieldsLoading;

  // Selections belong to the record type on screen (the page is keyed by it).
  useEffect(() => () => setSelectedFieldIds({}), [setSelectedFieldIds]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (
      !over ||
      active.id === over.id ||
      typeof active.id !== 'string' ||
      typeof over.id !== 'string'
    ) {
      return;
    }

    const { changed } = reorderItems(groups, active.id, over.id);

    if (changed.length) reorder.mutate(changed);
  };

  return (
    <>
      <PropertyGroupEditSheet />
      <PropertyGroupLayoutSheet
        fieldsOf={(groupId) => fields.filter((field) => field.groupId === groupId)}
      />
      <PropertyArchiveDialog />
      <div className="m-3 max-w-4xl mx-auto flex flex-col gap-2">
        {error ? (
          <p className="py-12 text-center text-sm text-destructive">{messageOf(error)}</p>
        ) : loading ? (
          <Spinner area="lg" />
        ) : groups.length === 0 && ungrouped.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            {t('no-groups-found', 'No field groups found')}
          </div>
        ) : (
          <>
            <DndContext
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis, restrictToParentElement]}
              onDragEnd={handleDragEnd}
              sensors={sensors}
            >
              <SortableContext
                items={groups.map((group) => group.id)}
                strategy={verticalListSortingStrategy}
              >
                {sections.map(
                  ({ group, fields: groupFieldList }) =>
                    group && (
                      <PropertiesGroupSection
                        key={group.id}
                        group={group}
                        fields={groupFieldList}
                        contentType={contentType}
                      />
                    ),
                )}
              </SortableContext>
            </DndContext>
            {ungrouped.length > 0 && (
              <PropertiesUngroupedSection fields={ungrouped} contentType={contentType} />
            )}
          </>
        )}
        <PropertiesArchivedSection contentType={contentType} />
      </div>
      <PropertiesCommandBar />
    </>
  );
};

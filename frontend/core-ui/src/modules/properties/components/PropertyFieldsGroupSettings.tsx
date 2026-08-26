import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from '@dnd-kit/modifiers';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { EnumCursorDirection, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useInView } from 'react-intersection-observer';
import { useParams } from 'react-router-dom';
import { useFieldGroups } from 'ui-modules';
import { useFieldGroupsReorder } from '../hooks/useFieldGroupsReorder';
import { PropertiesCommandBar } from './record/PropertiesCommandBar';
import { PropertiesGroupSection } from './record/PropertiesGroupSection';
import { PropertyGroupEditSheet } from './PropertyGroupEdit';

export const PropertyFieldsGroupSettings = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const { type: contentType } = useParams<{ type: string }>();
  const { fieldGroups, loading, handleFetchMore, pageInfo } = useFieldGroups({
    contentType: contentType || '',
  });

  const { reorderFieldGroups } = useFieldGroupsReorder({
    contentType: contentType || '',
  });

  const [loadMoreRef] = useInView({
    onChange(inView) {
      if (inView) {
        handleFetchMore({ direction: EnumCursorDirection.FORWARD });
      }
    },
  });

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
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

    reorderFieldGroups(fieldGroups, active.id, over.id);
  };

  return (
    <>
      <PropertyGroupEditSheet />
      <div className="m-3 max-w-4xl mx-auto flex flex-col gap-2">
        {loading ? (
          <Spinner containerClassName="py-12" />
        ) : fieldGroups.length === 0 ? (
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
                items={fieldGroups.map((group) => group._id)}
                strategy={verticalListSortingStrategy}
              >
                {fieldGroups.map((group) => (
                  <PropertiesGroupSection
                    key={group._id}
                    group={group}
                    contentType={contentType || ''}
                  />
                ))}
              </SortableContext>
            </DndContext>
            {pageInfo?.hasNextPage && (
              <div ref={loadMoreRef}>
                <Spinner containerClassName="py-6" />
              </div>
            )}
          </>
        )}
      </div>
      <PropertiesCommandBar />
    </>
  );
};

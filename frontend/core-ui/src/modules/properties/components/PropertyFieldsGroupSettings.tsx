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
import { IconListDetails } from '@tabler/icons-react';
import { Button, cn, EnumCursorDirection, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { IPropertyContentScope, useFieldGroups } from 'ui-modules';
import { useFieldGroupsReorder } from '../hooks/useFieldGroupsReorder';
import { PropertiesCommandBar } from './record/PropertiesCommandBar';
import { PropertiesGroupSection } from './record/PropertiesGroupSection';
import { PropertiesSystemFieldsSection } from './record/PropertiesSystemFieldsSection';
import { PropertyGroupEditSheet } from './PropertyGroupEdit';
import { PropertyGroupLayoutSheet } from './PropertyGroupLayoutSheet';
import { PropertyArchiveDialog } from './PropertyArchiveDialog';
import { PropertiesArchivedSection } from './record/PropertiesArchivedSection';
import { getPerTypePropertiesPath } from '../constants/perTypeContentTypes';

export const PropertyFieldsGroupSettings = ({
  contentType,
  contentTypeId,
  className,
}: IPropertyContentScope & { className?: string }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const perTypePath = getPerTypePropertiesPath(contentType, contentTypeId);
  const { fieldGroups, loading, handleFetchMore, pageInfo } = useFieldGroups({
    contentType,
    contentTypeId,
    skip: !!perTypePath,
  });

  const { reorderFieldGroups } = useFieldGroupsReorder({
    contentType,
    contentTypeId,
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
      <PropertyGroupLayoutSheet />
      <PropertyArchiveDialog contentType={contentType} />
      <div
        className={cn('m-3 max-w-4xl mx-auto flex flex-col gap-2', className)}
      >
        {!contentTypeId && (
          <PropertiesSystemFieldsSection contentType={contentType} />
        )}
        {perTypePath ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
            {t('per-type-fields')}
            <Button variant="outline" asChild>
              <Link to={perTypePath}>
                <IconListDetails />
                {t('manage-per-type')}
              </Link>
            </Button>
          </div>
        ) : loading ? (
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
                    contentType={contentType}
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
        {!perTypePath && (
          <PropertiesArchivedSection
            contentType={contentType}
            contentTypeId={contentTypeId}
          />
        )}
      </div>
      <PropertiesCommandBar />
    </>
  );
};

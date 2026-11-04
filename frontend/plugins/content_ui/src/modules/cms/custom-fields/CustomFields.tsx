import {
  Button,
  Table,
  Spinner,
  useConfirm,
  toast,
  PageContainer,
  cn,
} from 'erxes-ui';
import { IconPlus } from '@tabler/icons-react';
import { ReactNode, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTranslation } from 'react-i18next';

import { CustomFieldsHeader } from './components/CustomFieldsHeader';
import { CmsSidebar } from '../shared/CmsSidebar';

import { ICustomFieldGroup, ICustomField } from './types/customFieldTypes';
import { useCustomFieldGroups } from './hooks/useCustomFieldGroups';
import { CustomFieldGroupItem } from './components/CustomFieldGroupItem';
import { useSyncedState } from './hooks/useSyncedState';
import { getCustomFieldPanelId } from './CustomFieldPanels';
import {
  CMS_CUSTOM_FIELD_CONTENT_TYPE,
  CMS_FIELD_GROUP_CONTENT_TYPE,
} from '@/cms/shared/side-panel/contentPanelTypes';
import { useContentPanel } from '@/cms/shared/side-panel/useContentPanel';

/** Provides drag positioning and handle props for a custom-field group. */
function SortableGroup({
  group,
  children,
}: Readonly<{
  group: ICustomFieldGroup;
  children: (dragHandleProps: React.HTMLAttributes<HTMLElement>) => ReactNode;
}>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: group._id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(isDragging && 'opacity-50')}
    >
      {children({ ...attributes, ...listeners })}
    </div>
  );
}

export function CustomFields() {
  const { t } = useTranslation('content');
  const { websiteId } = useParams();
  const [selectedGroup, setSelectedGroup] = useState<ICustomFieldGroup | null>(
    null,
  );
  const { confirm } = useConfirm();
  const groupPanel = useContentPanel(CMS_FIELD_GROUP_CONTENT_TYPE);
  const fieldPanel = useContentPanel(CMS_CUSTOM_FIELD_CONTENT_TYPE);

  const {
    groups,
    loading,
    refetch,
    editGroup,
    removeGroup,
    reorderGroups,
    reorderFields,
  } = useCustomFieldGroups(websiteId);

  // Local order so a drop reflects immediately (no snap-back while the
  // persisted order round-trips); re-synced whenever the stored order changes.
  const [orderedGroups, setOrderedGroups] = useSyncedState(groups);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleGroupDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;

    const oldIndex = orderedGroups.findIndex((g) => g._id === active.id);
    const newIndex = orderedGroups.findIndex((g) => g._id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const next = arrayMove(orderedGroups, oldIndex, newIndex);
    setOrderedGroups(next);
    reorderGroups(next);
  };

  const handleAddGroup = () => {
    groupPanel.openDraft({ clientPortalId: websiteId });
  };

  const handleEditGroup = (group: ICustomFieldGroup) => {
    groupPanel.openDetail(group._id);
  };

  const handleEditField = (field: ICustomField) => {
    if (!selectedGroup) return;
    fieldPanel.openDetail(getCustomFieldPanelId(selectedGroup._id, field._id));
  };

  const handleDeleteGroup = (groupId: string) => {
    confirm({
      message: t('confirm-delete-field-group'),
    }).then(() => {
      removeGroup({ variables: { _id: groupId } });
    });
  };

  const handleDeleteField = (fieldId: string) => {
    if (!selectedGroup) return;
    confirm({
      message: t('confirm-delete-field'),
    }).then(async () => {
      const latestGroup =
        groups.find((g) => g._id === selectedGroup._id) || selectedGroup;
      const currentFields = Array.isArray(latestGroup.fields)
        ? latestGroup.fields
        : [];
      const updatedFields = currentFields.filter((f: any) => f._id !== fieldId);

      editGroup({
        variables: {
          _id: latestGroup._id,
          input: {
            label: latestGroup.label,
            clientPortalId: websiteId || '',
            customPostTypeIds: latestGroup.customPostTypeIds || [],
            fields: updatedFields,
          },
        },
        onCompleted: async () => {
          toast({ title: t('success'), description: t('field-deleted') });
          const result = await refetch();
          if (result.data?.cmsCustomFieldGroupList?.list) {
            const updatedGroup = result.data.cmsCustomFieldGroupList.list.find(
              (g: ICustomFieldGroup) => g._id === latestGroup._id,
            );
            if (updatedGroup) {
              setSelectedGroup(updatedGroup);
            }
          }
        },
      });
    });
  };

  return (
    <PageContainer className="flex-row">
      <CmsSidebar />
      <div className="flex min-w-0 flex-auto flex-col overflow-hidden">
        <CustomFieldsHeader>
          <Button onClick={handleAddGroup}>
            <IconPlus className="w-4 h-4 mr-2" />
            {t('add-group')}
          </Button>
        </CustomFieldsHeader>
        <div className="flex min-h-0 overflow-hidden flex-col flex-auto w-full">
          <div className="min-h-0 flex-auto overflow-y-auto">
            <div className="p-6">
              <div className="max-w-lg mx-auto flex flex-col gap-2">
                {/* Table Header */}
                <Table>
                  <Table.Header>
                    <Table.Row>
                      <Table.Head>{t('name')}</Table.Head>
                      <Table.Head>{t('type')}</Table.Head>
                      <Table.Head className="w-12"></Table.Head>
                    </Table.Row>
                  </Table.Header>
                </Table>

                {/* Groups List */}
                {loading ? (
                  <div className="py-12 text-center">
                    <Spinner />
                  </div>
                ) : groups.length === 0 ? (
                  <div className="py-12 text-center border rounded-lg mt-2">
                    <p className="text-muted-foreground mb-4">
                      {t('no-field-groups-yet')}
                    </p>
                    <Button variant="secondary" onClick={handleAddGroup}>
                      <IconPlus className="w-4 h-4 mr-2" />
                      {t('create-first-group')}
                    </Button>
                  </div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleGroupDragEnd}
                  >
                    <SortableContext
                      items={orderedGroups.map((g) => g._id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="flex flex-col gap-2 mt-2">
                        {orderedGroups.map((group) => (
                          <SortableGroup key={group._id} group={group}>
                            {(dragHandleProps) => (
                              <CustomFieldGroupItem
                                group={group}
                                selectedGroupId={selectedGroup?._id || null}
                                onSelectGroup={setSelectedGroup}
                                onEditGroup={handleEditGroup}
                                onDeleteGroup={handleDeleteGroup}
                                onEditField={handleEditField}
                                onDeleteField={handleDeleteField}
                                onReorderFields={reorderFields}
                                dragHandleProps={dragHandleProps}
                                onAddField={() => {
                                  setSelectedGroup(group);
                                  fieldPanel.openDraft({ groupId: group._id });
                                }}
                              />
                            )}
                          </SortableGroup>
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

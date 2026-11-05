import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import { Badge, Button, Spinner, Table, Tabs, useConfirm } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { IBranch } from '@/tms/types/branch';
import {
  TMS_CUSTOM_FIELD_CONTENT_TYPE,
  TMS_FIELD_GROUP_CONTENT_TYPE,
  TMS_TOUR_TYPE_CONTENT_TYPE,
} from '@/tms/side-panel/tourismPanelTypes';
import { useTourismPanel } from '@/tms/side-panel/useTourismPanel';
import type {
  ITourCustomField,
  ITourCustomFieldGroup,
  ITourCustomPostType,
} from '../tours/hooks/useTourCustomFields';
import {
  getTourCustomFieldKey,
  getTourCustomFieldPanelId,
} from '../custom-fields/customFieldUtils';
import {
  useFieldGroupList,
  useFieldGroupMutations,
  useTourTypeList,
  useTourTypeMutations,
} from '../custom-fields/useCustomFieldData';

export const CustomFieldsCreateButtons = ({
  branchId,
}: {
  branchId: string;
}) => {
  const { t } = useTranslation('tourism');
  const typePanel = useTourismPanel(TMS_TOUR_TYPE_CONTENT_TYPE);
  const groupPanel = useTourismPanel(TMS_FIELD_GROUP_CONTENT_TYPE);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        onClick={() => typePanel.openDraft({ branchId })}
      >
        <IconPlus />
        {t('tour-type')}
      </Button>
      <Button onClick={() => groupPanel.openDraft({ branchId })}>
        <IconPlus />
        {t('field-group')}
      </Button>
    </div>
  );
};

export const CustomFieldsPage = ({ branch }: { branch: IBranch }) => {
  const { t } = useTranslation('tourism');
  const { confirm } = useConfirm();
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const typePanel = useTourismPanel(TMS_TOUR_TYPE_CONTENT_TYPE);
  const groupPanel = useTourismPanel(TMS_FIELD_GROUP_CONTENT_TYPE);
  const fieldPanel = useTourismPanel(TMS_CUSTOM_FIELD_CONTENT_TYPE);

  const {
    customTypes,
    typeOptions,
    loading: typesLoading,
  } = useTourTypeList(branch._id);
  const { groups, loading: groupsLoading } = useFieldGroupList(branch._id);
  const { removeTourType } = useTourTypeMutations();
  const { removeFieldGroup, saveGroupFields } = useFieldGroupMutations();

  const selectedGroup =
    groups.find((group) => group._id === selectedGroupId) || groups[0] || null;

  const handleRemoveType = (type: ITourCustomPostType) => {
    confirm({
      message: t('confirm-delete-tour-type', { label: type.label }),
    }).then(() => removeTourType(type._id));
  };

  const handleRemoveGroup = (group: ITourCustomFieldGroup) => {
    confirm({
      message: t('confirm-delete-field-group', { label: group.label }),
    }).then(() => removeFieldGroup(group._id));
  };

  const handleRemoveField = (
    group: ITourCustomFieldGroup,
    field: ITourCustomField,
  ) => {
    confirm({
      message: t('confirm-delete-field', { label: field.label }),
    }).then(() =>
      saveGroupFields(
        group,
        (group.fields || []).filter(
          (item) =>
            getTourCustomFieldKey(item) !== getTourCustomFieldKey(field),
        ),
        branch._id,
      ),
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-auto min-h-0 p-4 overflow-auto">
        <Tabs defaultValue="groups" className="flex flex-col gap-4">
          <Tabs.List className="w-fit">
            <Tabs.Trigger value="groups">{t('field-groups')}</Tabs.Trigger>
            <Tabs.Trigger value="types">{t('tour-types')}</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="groups" className="min-h-0">
            <FieldGroupsView
              groups={groups}
              typeOptions={typeOptions}
              loading={groupsLoading}
              selectedGroup={selectedGroup}
              onSelectGroup={(group) => setSelectedGroupId(group?._id || null)}
              onEditGroup={(group) => groupPanel.openDetail(group._id)}
              onRemoveGroup={handleRemoveGroup}
              onAddField={(group) => {
                setSelectedGroupId(group._id);
                fieldPanel.openDraft({
                  branchId: branch._id,
                  groupId: group._id,
                });
              }}
              onEditField={(group, field) => {
                setSelectedGroupId(group._id);
                fieldPanel.openDetail(
                  getTourCustomFieldPanelId(
                    group._id,
                    getTourCustomFieldKey(field),
                  ),
                );
              }}
              onRemoveField={handleRemoveField}
            />
          </Tabs.Content>

          <Tabs.Content value="types" className="min-h-0">
            <TourTypesView
              customTypes={customTypes}
              loading={typesLoading}
              onEditType={(type) => typePanel.openDetail(type._id)}
              onRemoveType={handleRemoveType}
            />
          </Tabs.Content>
        </Tabs>
      </div>
    </div>
  );
};

const TourTypesView = ({
  customTypes,
  loading,
  onEditType,
  onRemoveType,
}: {
  customTypes: ITourCustomPostType[];
  loading: boolean;
  onEditType: (type: ITourCustomPostType) => void;
  onRemoveType: (type: ITourCustomPostType) => void;
}) => {
  const { t } = useTranslation('tourism');
  if (loading) {
    return <LoadingBlock />;
  }

  return (
    <div className="overflow-hidden border rounded-lg bg-background">
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Head className="w-[45%] px-4">{t('label')}</Table.Head>
            <Table.Head className="px-4">{t('key')}</Table.Head>
            <Table.Head className="px-4 w-28">{t('status')}</Table.Head>
            <Table.Head className="w-20" />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {customTypes.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={4} className="h-24 text-center">
                {t('no-custom-tour-types-yet')}
              </Table.Cell>
            </Table.Row>
          ) : (
            customTypes.map((type) => (
              <Table.Row key={type._id}>
                <Table.Cell className="min-w-0 px-4 py-3 whitespace-normal">
                  <div className="font-medium break-words [overflow-wrap:anywhere]">
                    {type.label}
                  </div>
                  {type.description && (
                    <div className="text-xs text-muted-foreground break-words [overflow-wrap:anywhere]">
                      {type.description}
                    </div>
                  )}
                </Table.Cell>
                <Table.Cell className="px-4 py-3 text-muted-foreground">
                  {type.code}
                </Table.Cell>
                <Table.Cell className="px-4 py-3">
                  <Badge
                    variant={type.isActive === false ? 'secondary' : 'default'}
                  >
                    {type.isActive === false ? t('inactive') : t('active')}
                  </Badge>
                </Table.Cell>
                <Table.Cell className="px-2 py-2">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Edit ${type.label}`}
                      onClick={() => onEditType(type)}
                    >
                      <IconEdit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${type.label}`}
                      onClick={() => onRemoveType(type)}
                    >
                      <IconTrash size={16} />
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table>
    </div>
  );
};

const FieldGroupsView = ({
  groups,
  typeOptions,
  loading,
  selectedGroup,
  onSelectGroup,
  onEditGroup,
  onRemoveGroup,
  onAddField,
  onEditField,
  onRemoveField,
}: {
  groups: ITourCustomFieldGroup[];
  typeOptions: ITourCustomPostType[];
  loading: boolean;
  selectedGroup: ITourCustomFieldGroup | null;
  onSelectGroup: (group: ITourCustomFieldGroup | null) => void;
  onEditGroup: (group: ITourCustomFieldGroup) => void;
  onRemoveGroup: (group: ITourCustomFieldGroup) => void;
  onAddField: (group: ITourCustomFieldGroup) => void;
  onEditField: (group: ITourCustomFieldGroup, field: ITourCustomField) => void;
  onRemoveField: (
    group: ITourCustomFieldGroup,
    field: ITourCustomField,
  ) => void;
}) => {
  const { t } = useTranslation('tourism');
  if (loading) {
    return <LoadingBlock />;
  }

  if (!groups.length) {
    return (
      <div className="flex items-center justify-center h-40 border rounded-lg text-muted-foreground">
        {t('no-custom-field-groups-yet')}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(320px,380px)_1fr] gap-4 min-h-[480px]">
      <div className="overflow-hidden border rounded-lg bg-background">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head className="px-4">{t('field-group')}</Table.Head>
              <Table.Head className="w-20" />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {groups.map((group) => (
              <Table.Row
                key={group._id}
                data-state={
                  selectedGroup?._id === group._id ? 'selected' : undefined
                }
                className="cursor-pointer"
                onClick={() => onSelectGroup(group)}
              >
                <Table.Cell className="min-w-0 px-4 py-3 whitespace-normal">
                  <div className="font-medium leading-5 break-words [overflow-wrap:anywhere]">
                    {group.label || t('untitled-group')}
                  </div>
                  {group.code && (
                    <div className="text-xs text-muted-foreground break-words [overflow-wrap:anywhere]">
                      {group.code}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {(group.customTourTypeIds || []).length === 0 ? (
                      <Badge variant="secondary">{t('all-tours')}</Badge>
                    ) : (
                      (group.customTourTypeIds || []).map((typeId) => (
                        <Badge
                          key={typeId}
                          variant="secondary"
                          className="max-w-full whitespace-normal"
                        >
                          <span className="break-words [overflow-wrap:anywhere]">
                            {typeOptions.find((type) => type._id === typeId)
                              ?.label || typeId}
                          </span>
                        </Badge>
                      ))
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell className="px-2 py-2">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Edit ${group.label || 'field group'}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        onEditGroup(group);
                      }}
                    >
                      <IconEdit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${group.label || 'field group'}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        onRemoveGroup(group);
                      }}
                    >
                      <IconTrash size={16} />
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>

      <div className="overflow-hidden border rounded-lg bg-background">
        {selectedGroup ? (
          <FieldList
            group={selectedGroup}
            onAddField={onAddField}
            onEditField={onEditField}
            onRemoveField={onRemoveField}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            {t('select-a-field-group')}
          </div>
        )}
      </div>
    </div>
  );
};

const FieldList = ({
  group,
  onAddField,
  onEditField,
  onRemoveField,
}: {
  group: ITourCustomFieldGroup;
  onAddField: (group: ITourCustomFieldGroup) => void;
  onEditField: (group: ITourCustomFieldGroup, field: ITourCustomField) => void;
  onRemoveField: (
    group: ITourCustomFieldGroup,
    field: ITourCustomField,
  ) => void;
}) => {
  const { t } = useTranslation('tourism');
  const fields = group.fields || [];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-4 border-b">
        <div className="min-w-0">
          <div className="font-medium break-words [overflow-wrap:anywhere]">
            {group.label}
          </div>
          <div className="text-xs text-muted-foreground">
            {t('fields-count', { count: fields.length })}
          </div>
        </div>
        <Button size="sm" className="ml-auto" onClick={() => onAddField(group)}>
          <IconPlus size={16} />
          {t('add-field')}
        </Button>
      </div>
      <div className="overflow-auto">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head className="w-[45%] px-4">{t('field')}</Table.Head>
              <Table.Head className="px-4">{t('type')}</Table.Head>
              <Table.Head className="w-24 px-4">{t('required')}</Table.Head>
              <Table.Head className="w-20" />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {fields.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={4} className="h-24 text-center">
                  {t('no-fields-in-group')}
                </Table.Cell>
              </Table.Row>
            ) : (
              fields.map((field) => (
                <Table.Row key={field._id || field.code}>
                  <Table.Cell className="min-w-0 px-4 py-3 whitespace-normal">
                    <div className="font-medium truncate">{field.label}</div>
                    <div className="text-xs text-muted-foreground break-words [overflow-wrap:anywhere]">
                      {field.code}
                    </div>
                  </Table.Cell>
                  <Table.Cell className="px-4 py-3 text-muted-foreground">
                    {field.type}
                  </Table.Cell>
                  <Table.Cell className="px-4 py-3">
                    {field.isRequired ? t('yes') : t('no')}
                  </Table.Cell>
                  <Table.Cell className="px-2 py-2">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit ${field.label}`}
                        onClick={() => onEditField(group, field)}
                      >
                        <IconEdit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete ${field.label}`}
                        onClick={() => onRemoveField(group, field)}
                      >
                        <IconTrash size={16} />
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
};

const LoadingBlock = () => (
  <div className="flex items-center justify-center h-40">
    <Spinner />
  </div>
);

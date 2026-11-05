import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { TourismPanelRecordState } from '@/tms/side-panel/TourismPanelLayout';
import { TourismPanelRemoveAction } from '@/tms/side-panel/TourismPanelRemoveAction';
import {
  ITourismPanelViewProps,
  ITourismPanelViews,
  TMS_CUSTOM_FIELD_CONTENT_TYPE,
  TMS_FIELD_GROUP_CONTENT_TYPE,
  TMS_TOUR_TYPE_CONTENT_TYPE,
} from '@/tms/side-panel/tourismPanelTypes';
import {
  useTourismPanel,
  useTourismPanelDraft,
  useTourismPanelRouteBranchId,
} from '@/tms/side-panel/useTourismPanel';
import { FieldForm, FieldGroupForm, TourTypeForm } from './CustomFieldForms';
import {
  SYSTEM_TOUR_TYPE,
  buildFieldFormValues,
  buildFieldGroupFormValues,
  buildTourTypeFormValues,
  getTourCustomFieldKey,
  getTourCustomFieldPanelId,
  parseTourCustomFieldPanelId,
  toFieldGroupInput,
  toTourCustomField,
  toTourTypeInput,
} from './customFieldUtils';
import {
  useFieldGroupList,
  useFieldGroupMutations,
  useTourTypeList,
  useTourTypeMutations,
} from './useCustomFieldData';

const TourTypePanelNew = () => {
  const { t } = useTranslation('tourism');
  const { branchId } = useTourismPanelDraft(TMS_TOUR_TYPE_CONTENT_TYPE);
  const { openDetail, cancelDraft } = useTourismPanel(
    TMS_TOUR_TYPE_CONTENT_TYPE,
  );
  const { addType, adding } = useTourTypeMutations();

  return (
    <TourTypeForm
      key={branchId}
      defaultValues={buildTourTypeFormValues()}
      isNew
      saving={adding}
      onCancel={cancelDraft}
      onSubmit={(values) =>
        addType({
          variables: { input: toTourTypeInput(values, branchId) },
          onCompleted: (data) => {
            toast({ title: t('success'), description: t('tour-type-created') });
            const createdId = data?.bmsCustomTourTypesAdd?._id;

            if (createdId) {
              openDetail(createdId, { replace: true });
            }
          },
        })
      }
    />
  );
};

const TourTypePanelDetail = ({ contentId }: ITourismPanelViewProps) => {
  const { t } = useTranslation('tourism');
  const branchId = useTourismPanelRouteBranchId();
  const { closePanel } = useTourismPanel(TMS_TOUR_TYPE_CONTENT_TYPE);
  const { customTypes, loading } = useTourTypeList(branchId);
  const { editType, editing } = useTourTypeMutations();
  const type = customTypes.find((item) => item._id === contentId);

  return (
    <TourismPanelRecordState loading={loading} hasRecord={!!type}>
      {type && (
        <TourTypeForm
          key={type._id}
          defaultValues={buildTourTypeFormValues(type)}
          isNew={false}
          saving={editing}
          onCancel={closePanel}
          onSubmit={(values) =>
            editType({
              variables: {
                _id: type._id,
                input: toTourTypeInput(values, type.branchId || branchId),
              },
              onCompleted: () => {
                toast({
                  title: t('success'),
                  description: t('tour-type-updated'),
                });
                closePanel();
              },
            })
          }
        />
      )}
    </TourismPanelRecordState>
  );
};

const TourTypePanelActions = ({ contentId }: ITourismPanelViewProps) => {
  const { t } = useTranslation('tourism');
  const branchId = useTourismPanelRouteBranchId();
  const { customTypes } = useTourTypeList(branchId);
  const { removeTourType, removing } = useTourTypeMutations();
  const type = customTypes.find((item) => item._id === contentId);

  if (contentId === SYSTEM_TOUR_TYPE._id || !type) {
    return null;
  }

  return (
    <TourismPanelRemoveAction
      message={t('confirm-delete-tour-type', { label: type.label })}
      loading={removing}
      onRemove={(onCompleted) => removeTourType(type._id, onCompleted)}
    />
  );
};

const FieldGroupPanelNew = () => {
  const { t } = useTranslation('tourism');
  const { branchId } = useTourismPanelDraft(TMS_FIELD_GROUP_CONTENT_TYPE);
  const { openDetail, cancelDraft } = useTourismPanel(
    TMS_FIELD_GROUP_CONTENT_TYPE,
  );
  const { typeOptions } = useTourTypeList(branchId);
  const { addGroup, adding } = useFieldGroupMutations();

  return (
    <FieldGroupForm
      key={branchId}
      defaultValues={buildFieldGroupFormValues()}
      typeOptions={typeOptions}
      isNew
      saving={adding}
      onCancel={cancelDraft}
      onSubmit={(values) =>
        addGroup({
          variables: { input: toFieldGroupInput(branchId, values) },
          onCompleted: (data) => {
            toast({
              title: t('success'),
              description: t('field-group-created'),
            });
            const createdId = data?.bmsCustomTourGroupsAdd?._id;

            if (createdId) {
              openDetail(createdId, { replace: true });
            }
          },
        })
      }
    />
  );
};

const FieldGroupPanelDetail = ({ contentId }: ITourismPanelViewProps) => {
  const { t } = useTranslation('tourism');
  const branchId = useTourismPanelRouteBranchId();
  const { closePanel } = useTourismPanel(TMS_FIELD_GROUP_CONTENT_TYPE);
  const { groups, loading } = useFieldGroupList(branchId);
  const { typeOptions } = useTourTypeList(branchId);
  const { editGroup, editing } = useFieldGroupMutations();
  const group = groups.find((item) => item._id === contentId);

  return (
    <TourismPanelRecordState loading={loading} hasRecord={!!group}>
      {group && (
        <FieldGroupForm
          key={group._id}
          defaultValues={buildFieldGroupFormValues(group)}
          typeOptions={typeOptions}
          isNew={false}
          saving={editing}
          onCancel={closePanel}
          onSubmit={(values) =>
            editGroup({
              variables: {
                _id: group._id,
                input: toFieldGroupInput(
                  group.branchId || branchId,
                  values,
                  group,
                ),
              },
              onCompleted: () => {
                toast({
                  title: t('success'),
                  description: t('field-group-updated'),
                });
                closePanel();
              },
            })
          }
        />
      )}
    </TourismPanelRecordState>
  );
};

const FieldGroupPanelActions = ({ contentId }: ITourismPanelViewProps) => {
  const { t } = useTranslation('tourism');
  const branchId = useTourismPanelRouteBranchId();
  const { groups } = useFieldGroupList(branchId);
  const { removeFieldGroup, removing } = useFieldGroupMutations();
  const group = groups.find((item) => item._id === contentId);

  if (!group) {
    return null;
  }

  return (
    <TourismPanelRemoveAction
      message={t('confirm-delete-field-group', { label: group.label })}
      loading={removing}
      onRemove={(onCompleted) => removeFieldGroup(group._id, onCompleted)}
    />
  );
};

const CustomFieldPanelNew = () => {
  const { branchId, groupId } = useTourismPanelDraft(
    TMS_CUSTOM_FIELD_CONTENT_TYPE,
  );
  const { openDetail, cancelDraft, closePanel } = useTourismPanel(
    TMS_CUSTOM_FIELD_CONTENT_TYPE,
  );
  const { groups, loading, refetch } = useFieldGroupList(branchId);
  const { saveGroupFields, editing } = useFieldGroupMutations();
  const group = groups.find((item) => item._id === groupId);

  return (
    <TourismPanelRecordState loading={loading} hasRecord={!!group}>
      {group && (
        <FieldForm
          key={group._id}
          defaultValues={buildFieldFormValues()}
          isNew
          saving={editing}
          onCancel={cancelDraft}
          onSubmit={(values) => {
            const currentFields = group.fields || [];
            const previousKeys = new Set(
              currentFields.map(getTourCustomFieldKey),
            );

            saveGroupFields(
              group,
              [...currentFields, toTourCustomField(values)],
              branchId,
              async () => {
                const result = await refetch();
                const latestGroup =
                  result.data?.bmsCustomTourGroupList?.list?.find(
                    (item) => item._id === group._id,
                  );
                const createdField = (latestGroup?.fields || []).find(
                  (field) => !previousKeys.has(getTourCustomFieldKey(field)),
                );

                if (createdField) {
                  openDetail(
                    getTourCustomFieldPanelId(
                      group._id,
                      getTourCustomFieldKey(createdField),
                    ),
                    { replace: true },
                  );
                  return;
                }

                closePanel();
              },
            );
          }}
        />
      )}
    </TourismPanelRecordState>
  );
};

const useGroupField = (contentId: string) => {
  const branchId = useTourismPanelRouteBranchId();
  const { groupId, fieldKey } = parseTourCustomFieldPanelId(contentId);
  const { groups, loading } = useFieldGroupList(branchId);
  const group = groups.find((item) => item._id === groupId);
  const field = (group?.fields || []).find(
    (item) => getTourCustomFieldKey(item) === fieldKey,
  );

  return { branchId, fieldKey, group, field, loading };
};

const CustomFieldPanelDetail = ({ contentId }: ITourismPanelViewProps) => {
  const { closePanel } = useTourismPanel(TMS_CUSTOM_FIELD_CONTENT_TYPE);
  const { branchId, fieldKey, group, field, loading } =
    useGroupField(contentId);
  const { saveGroupFields, editing } = useFieldGroupMutations();

  return (
    <TourismPanelRecordState loading={loading} hasRecord={!!field}>
      {group && field && (
        <FieldForm
          key={fieldKey}
          defaultValues={buildFieldFormValues(field)}
          isNew={false}
          saving={editing}
          onCancel={closePanel}
          onSubmit={(values) =>
            saveGroupFields(
              group,
              (group.fields || []).map((item) =>
                getTourCustomFieldKey(item) === fieldKey
                  ? toTourCustomField(values, item)
                  : item,
              ),
              branchId,
              closePanel,
            )
          }
        />
      )}
    </TourismPanelRecordState>
  );
};

const CustomFieldPanelActions = ({ contentId }: ITourismPanelViewProps) => {
  const { t } = useTranslation('tourism');
  const { branchId, fieldKey, group, field } = useGroupField(contentId);
  const { saveGroupFields, editing } = useFieldGroupMutations();

  if (!group || !field) {
    return null;
  }

  return (
    <TourismPanelRemoveAction
      message={t('confirm-delete-field', { label: field.label })}
      loading={editing}
      onRemove={(onCompleted) =>
        saveGroupFields(
          group,
          (group.fields || []).filter(
            (item) => getTourCustomFieldKey(item) !== fieldKey,
          ),
          branchId,
          onCompleted,
        )
      }
    />
  );
};

export const TOUR_TYPE_PANEL: ITourismPanelViews = {
  addLabel: 'new-tour-type',
  editLabel: 'edit-tour-type',
  New: TourTypePanelNew,
  Detail: TourTypePanelDetail,
  Actions: TourTypePanelActions,
};

export const FIELD_GROUP_PANEL: ITourismPanelViews = {
  addLabel: 'new-field-group',
  editLabel: 'edit-field-group',
  New: FieldGroupPanelNew,
  Detail: FieldGroupPanelDetail,
  Actions: FieldGroupPanelActions,
};

export const CUSTOM_FIELD_PANEL: ITourismPanelViews = {
  addLabel: 'new-field',
  editLabel: 'edit-field',
  New: CustomFieldPanelNew,
  Detail: CustomFieldPanelDetail,
  Actions: CustomFieldPanelActions,
};

export { getTourCustomFieldPanelId };

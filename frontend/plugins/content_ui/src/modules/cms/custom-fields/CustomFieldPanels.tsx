import { useMutation, useQuery } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { CMS_CUSTOM_POST_TYPES } from '../graphql/queries';
import { ContentPanelRecordState } from '@/cms/shared/side-panel/ContentPanelLayout';
import { ContentPanelRemoveAction } from '@/cms/shared/side-panel/ContentPanelRemoveAction';
import {
  CMS_CUSTOM_FIELD_CONTENT_TYPE,
  CMS_FIELD_GROUP_CONTENT_TYPE,
  IContentPanelViewProps,
  IContentPanelViews,
} from '@/cms/shared/side-panel/contentPanelTypes';
import {
  useContentPanel,
  useContentPanelDraft,
} from '@/cms/shared/side-panel/useContentPanel';
import { FieldGroupForm } from './components/field-group-drawer/FieldGroupForm';
import { FieldForm } from './components/field-drawer/FieldForm';
import {
  CMS_CUSTOM_FIELD_GROUP_ADD,
  CMS_CUSTOM_FIELD_GROUP_EDIT,
  CMS_CUSTOM_FIELD_GROUP_REMOVE,
} from './graphql/mutations';
import { CMS_CUSTOM_FIELD_GROUP_DETAIL } from './graphql/queries';
import {
  FieldFormValues,
  ICustomField,
  ICustomFieldGroup,
} from './types/customFieldTypes';
import { getValidCustomFieldOptions } from './utils/getValidCustomFieldOptions';

interface IFieldGroupFormValues {
  label: string;
  code: string;
  customPostTypeIds?: string[];
  enabledPageIds?: string[];
  enabledCategoryIds?: string[];
  enabledPostIds?: string[];
}

const FIELD_GROUP_REFETCH_QUERIES = [
  'cmsCustomFieldGroupList',
  'CmsCustomFieldGroupDetail',
];

const FIELD_ID_SEPARATOR = '~';

export const getCustomFieldPanelId = (groupId: string, fieldId: string) =>
  `${groupId}${FIELD_ID_SEPARATOR}${fieldId}`;

const parseCustomFieldPanelId = (contentId: string) => {
  const [groupId = '', fieldId = ''] = contentId.split(FIELD_ID_SEPARATOR);

  return { groupId, fieldId };
};

const useFieldGroupDetail = (groupId: string) => {
  const { data, loading } = useQuery(CMS_CUSTOM_FIELD_GROUP_DETAIL, {
    variables: { _id: groupId },
    skip: !groupId,
    fetchPolicy: 'cache-and-network',
  });
  const group: ICustomFieldGroup | undefined = data?.cmsCustomFieldGroup;

  return { group, loading };
};

const useEditFieldGroup = () => {
  const { t } = useTranslation('content');

  return useMutation(CMS_CUSTOM_FIELD_GROUP_EDIT, {
    refetchQueries: FIELD_GROUP_REFETCH_QUERIES,
    onError: (error) =>
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive',
      }),
  });
};

const toGroupInput = (data: IFieldGroupFormValues, clientPortalId: string) => ({
  label: data.label,
  code: data.code,
  clientPortalId,
  customPostTypeIds: data.customPostTypeIds || [],
  enabledPageIds: data.enabledPageIds || [],
  enabledCategoryIds: data.enabledCategoryIds || [],
  enabledPostIds: data.enabledPostIds || [],
});

const toFieldsInput = (group: ICustomFieldGroup, fields: ICustomField[]) => ({
  label: group.label,
  clientPortalId: group.clientPortalId,
  customPostTypeIds: group.customPostTypeIds || [],
  fields,
});

const getGroupFields = (group: ICustomFieldGroup) =>
  Array.isArray(group.fields) ? group.fields : [];

const FieldGroupPanelForm = ({
  group,
  clientPortalId,
  saving,
  onCancel,
  onSubmit,
}: {
  group?: ICustomFieldGroup;
  clientPortalId: string;
  saving: boolean;
  onCancel: () => void;
  onSubmit: (data: IFieldGroupFormValues) => void;
}) => {
  const { data } = useQuery(CMS_CUSTOM_POST_TYPES, {
    variables: { clientPortalId },
    skip: !clientPortalId,
  });

  return (
    <FieldGroupForm
      onCancel={onCancel}
      onSubmit={onSubmit}
      saving={saving}
      editingGroup={group || null}
      customTypes={data?.cmsCustomPostTypes || []}
      websiteId={clientPortalId}
    />
  );
};

const FieldGroupPanelNew = () => {
  const { t } = useTranslation('content');
  const { clientPortalId } = useContentPanelDraft(CMS_FIELD_GROUP_CONTENT_TYPE);
  const { openDetail, cancelDraft } = useContentPanel(
    CMS_FIELD_GROUP_CONTENT_TYPE,
  );
  const [addGroup, { loading }] = useMutation(CMS_CUSTOM_FIELD_GROUP_ADD, {
    refetchQueries: FIELD_GROUP_REFETCH_QUERIES,
    onCompleted: (data) => {
      toast({ title: t('success'), description: t('field-group-created') });

      if (data?.cmsCustomFieldGroupsAdd?._id) {
        openDetail(data.cmsCustomFieldGroupsAdd._id, { replace: true });
      }
    },
    onError: (error) =>
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive',
      }),
  });

  return (
    <FieldGroupPanelForm
      key={clientPortalId}
      clientPortalId={clientPortalId}
      saving={loading}
      onCancel={cancelDraft}
      onSubmit={(data) =>
        addGroup({
          variables: {
            input: { ...toGroupInput(data, clientPortalId), fields: [] },
          },
        })
      }
    />
  );
};

const FieldGroupPanelDetail = ({ contentId }: IContentPanelViewProps) => {
  const { t } = useTranslation('content');
  const { closePanel } = useContentPanel(CMS_FIELD_GROUP_CONTENT_TYPE);
  const { group, loading } = useFieldGroupDetail(contentId);
  const [editGroup, { loading: saving }] = useEditFieldGroup();

  return (
    <ContentPanelRecordState loading={loading} hasRecord={!!group}>
      {group && (
        <FieldGroupPanelForm
          key={group._id}
          group={group}
          clientPortalId={group.clientPortalId}
          saving={saving}
          onCancel={closePanel}
          onSubmit={(data) =>
            editGroup({
              variables: {
                _id: group._id,
                input: {
                  ...toGroupInput(data, group.clientPortalId),
                  fields: getGroupFields(group),
                },
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
    </ContentPanelRecordState>
  );
};

const FieldGroupPanelActions = ({ contentId }: IContentPanelViewProps) => {
  const { t } = useTranslation('content');
  const [removeGroup, { loading }] = useMutation(
    CMS_CUSTOM_FIELD_GROUP_REMOVE,
    {
      refetchQueries: ['cmsCustomFieldGroupList'],
    },
  );

  return (
    <ContentPanelRemoveAction
      message={t('confirm-delete-field-group')}
      loading={loading}
      onRemove={(onCompleted) =>
        removeGroup({
          variables: { _id: contentId },
          onCompleted: () => {
            toast({
              title: t('success'),
              description: t('field-group-deleted'),
            });
            onCompleted();
          },
          onError: (error) =>
            toast({
              title: t('error'),
              description: error.message,
              variant: 'destructive',
            }),
        })
      }
    />
  );
};

const toCustomField = (
  data: FieldFormValues,
  fieldId: string,
): ICustomField => ({
  _id: fieldId,
  label: data.label,
  code: data.code,
  type: data.type,
  description: data.description,
  isRequired: data.isRequired,
  options: getValidCustomFieldOptions(
    data.options.split(',').map((option) => option.trim()),
  ),
});

const CustomFieldPanelNew = () => {
  const { t } = useTranslation('content');
  const { groupId } = useContentPanelDraft(CMS_CUSTOM_FIELD_CONTENT_TYPE);
  const { openDetail, cancelDraft } = useContentPanel(
    CMS_CUSTOM_FIELD_CONTENT_TYPE,
  );
  const { group, loading } = useFieldGroupDetail(groupId || '');
  const [editGroup, { loading: saving }] = useEditFieldGroup();

  const handleSubmit = (data: FieldFormValues) => {
    if (!group) return;

    const field = toCustomField(data, `field_${Date.now()}`);

    editGroup({
      variables: {
        _id: group._id,
        input: toFieldsInput(group, [...getGroupFields(group), field]),
      },
      onCompleted: () => {
        toast({ title: t('success'), description: t('field-created') });
        openDetail(getCustomFieldPanelId(group._id, field._id), {
          replace: true,
        });
      },
    });
  };

  return (
    <ContentPanelRecordState loading={loading} hasRecord={!!group}>
      <FieldForm
        onCancel={cancelDraft}
        onSubmit={handleSubmit}
        saving={saving}
        editingField={null}
      />
    </ContentPanelRecordState>
  );
};

const CustomFieldPanelDetail = ({ contentId }: IContentPanelViewProps) => {
  const { t } = useTranslation('content');
  const { closePanel } = useContentPanel(CMS_CUSTOM_FIELD_CONTENT_TYPE);
  const { groupId, fieldId } = parseCustomFieldPanelId(contentId);
  const { group, loading } = useFieldGroupDetail(groupId);
  const [editGroup, { loading: saving }] = useEditFieldGroup();
  const field = group && getGroupFields(group).find((f) => f._id === fieldId);

  const handleSubmit = (data: FieldFormValues) => {
    if (!group) return;

    editGroup({
      variables: {
        _id: group._id,
        input: toFieldsInput(
          group,
          getGroupFields(group).map((f) =>
            f._id === fieldId ? toCustomField(data, fieldId) : f,
          ),
        ),
      },
      onCompleted: () => {
        toast({ title: t('success'), description: t('field-updated') });
        closePanel();
      },
    });
  };

  return (
    <ContentPanelRecordState loading={loading} hasRecord={!!field}>
      {field && (
        <FieldForm
          key={field._id}
          onCancel={closePanel}
          onSubmit={handleSubmit}
          saving={saving}
          editingField={field}
        />
      )}
    </ContentPanelRecordState>
  );
};

const CustomFieldPanelActions = ({ contentId }: IContentPanelViewProps) => {
  const { t } = useTranslation('content');
  const { groupId, fieldId } = parseCustomFieldPanelId(contentId);
  const { group } = useFieldGroupDetail(groupId);
  const [editGroup, { loading }] = useEditFieldGroup();

  return (
    <ContentPanelRemoveAction
      message={t('confirm-delete-field')}
      loading={loading || !group}
      onRemove={(onCompleted) => {
        if (!group) return;

        editGroup({
          variables: {
            _id: group._id,
            input: toFieldsInput(
              group,
              getGroupFields(group).filter((f) => f._id !== fieldId),
            ),
          },
          onCompleted: () => {
            toast({ title: t('success'), description: t('field-deleted') });
            onCompleted();
          },
        });
      }}
    />
  );
};

export const FIELD_GROUP_PANEL: IContentPanelViews = {
  addLabel: 'add-field-group',
  editLabel: 'edit-field-group',
  New: FieldGroupPanelNew,
  Detail: FieldGroupPanelDetail,
  Actions: FieldGroupPanelActions,
};

export const CUSTOM_FIELD_PANEL: IContentPanelViews = {
  addLabel: 'add-field',
  editLabel: 'edit-field',
  New: CustomFieldPanelNew,
  Detail: CustomFieldPanelDetail,
  Actions: CustomFieldPanelActions,
};

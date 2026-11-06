import { gql, useMutation, useQuery } from '@apollo/client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  IconArticle,
  IconCategory,
  IconEye,
  IconFile,
} from '@tabler/icons-react';
import {
  Form,
  Input,
  MultiSelectOption,
  MultipleSelector,
  Select,
  Switch,
  Textarea,
  toast,
} from 'erxes-ui';
import { PanelFormLayout } from 'ui-modules';
import { CMS_CUSTOM_POST_TYPES } from '../graphql/queries';
import { ContentPanelRecordState } from '@/cms/shared/side-panel/ContentPanelLayout';
import {
  CONTENT_PANEL_INPUT_CLASS_NAME,
  ContentPanelFormField,
} from '@/cms/shared/side-panel/ContentPanelForm';
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
import {
  CMS_CUSTOM_FIELD_GROUP_ADD,
  CMS_CUSTOM_FIELD_GROUP_EDIT,
  CMS_CUSTOM_FIELD_GROUP_REMOVE,
} from './graphql/mutations';
import { CMS_CUSTOM_FIELD_GROUP_DETAIL } from './graphql/queries';
import {
  FIELD_TYPES,
  FieldFormValues,
  ICustomField,
  ICustomFieldGroup,
} from './types/customFieldTypes';
import { getValidCustomFieldOptions } from './utils/getValidCustomFieldOptions';

const CMS_FIELD_GROUP_RULE_TARGETS = gql`
  query CmsFieldGroupRuleTargets($clientPortalId: String!) {
    cmsPageList(clientPortalId: $clientPortalId, limit: 100) {
      pages {
        _id
        name
      }
    }
    cmsCategories(clientPortalId: $clientPortalId, limit: 100) {
      list {
        _id
        name
      }
    }
    cmsPostList(clientPortalId: $clientPortalId, limit: 100) {
      posts {
        _id
        title
      }
    }
  }
`;

interface IRuleTargetsData {
  cmsPageList?: { pages?: { _id: string; name: string }[] };
  cmsCategories?: { list?: { _id: string; name: string }[] };
  cmsPostList?: { posts?: { _id: string; title?: string }[] };
}

interface ICustomPostTypeOption {
  _id: string;
  code: string;
  label: string;
}

interface IFieldGroupFormValues {
  label: string;
  code: string;
  customPostTypeIds?: string[];
  enabledPageIds?: string[];
  enabledCategoryIds?: string[];
  enabledPostIds?: string[];
}

interface IFieldGroupFormState {
  label: string;
  code: string;
  customPostTypeIds: string[];
  enabledPageId: string;
  enabledCategoryIds: string[];
  enabledPostIds: string[];
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
  const { data, loading, error } = useQuery(CMS_CUSTOM_FIELD_GROUP_DETAIL, {
    variables: { _id: groupId },
    skip: !groupId,
    fetchPolicy: 'cache-and-network',
  });
  const group: ICustomFieldGroup | undefined = data?.cmsCustomFieldGroup;

  return { group, loading, error };
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

const BUILT_IN_SHOW_ON: MultiSelectOption[] = [
  { label: 'Pages', value: 'page' },
  { label: 'Categories', value: 'category' },
  { label: 'Posts', value: 'post' },
];

const normalizeOptionText = (text: string) => text.toLowerCase().trim();

const getSearchableCommandProps = (options: MultiSelectOption[]) => ({
  filter: (value: string, search: string) => {
    const option = options.find((item) => item.value === value);
    const text = normalizeOptionText(`${option?.label || ''} ${value}`);

    return text.includes(normalizeOptionText(search)) ? 1 : -1;
  },
});

const toFieldGroupFormState = (
  group?: ICustomFieldGroup,
): IFieldGroupFormState => ({
  label: group?.label || '',
  code: group?.code || '',
  customPostTypeIds: group?.customPostTypeIds || [],
  enabledPageId: group?.enabledPageIds?.[0] || '',
  enabledCategoryIds: group?.enabledCategoryIds || [],
  enabledPostIds: group?.enabledPostIds || [],
});

const pickOptions = (options: MultiSelectOption[], values: string[]) =>
  options.filter((option) => values.includes(option.value));

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
  const { t } = useTranslation('content');
  const form = useForm<IFieldGroupFormState>({
    defaultValues: toFieldGroupFormState(group),
  });
  const { data: customTypesData } = useQuery(CMS_CUSTOM_POST_TYPES, {
    variables: { clientPortalId },
    skip: !clientPortalId,
  });
  const { data: targetsData } = useQuery<IRuleTargetsData>(
    CMS_FIELD_GROUP_RULE_TARGETS,
    {
      variables: { clientPortalId },
      skip: !clientPortalId,
      fetchPolicy: 'cache-first',
    },
  );

  useEffect(() => {
    form.reset(toFieldGroupFormState(group));
  }, [group, form]);

  const customTypes: ICustomPostTypeOption[] =
    customTypesData?.cmsCustomPostTypes || [];
  const showOnOptions: MultiSelectOption[] = [
    ...BUILT_IN_SHOW_ON,
    ...customTypes.map((type) => ({
      label: `${type.label} (${type.code})`,
      value: type._id,
    })),
  ];
  const pages: MultiSelectOption[] = (
    targetsData?.cmsPageList?.pages || []
  ).map((page) => ({ label: page.name, value: page._id }));
  const categories: MultiSelectOption[] = (
    targetsData?.cmsCategories?.list || []
  ).map((category) => ({ label: category.name, value: category._id }));
  const posts: MultiSelectOption[] = (
    targetsData?.cmsPostList?.posts || []
  ).map((post) => ({ label: post.title || post._id, value: post._id }));

  const showOnIds = form.watch('customPostTypeIds');

  const handleSubmit = (data: IFieldGroupFormState) =>
    onSubmit({
      ...data,
      enabledPageIds: data.enabledPageId ? [data.enabledPageId] : [],
    });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-1 min-h-0 flex-col"
      >
        <PanelFormLayout
          onCancel={onCancel}
          saving={saving}
          saveLabel={group ? t('update') : t('create')}
        >
          <ContentPanelFormField
            control={form.control}
            name="label"
            label={t('label')}
            required
            rules={{ required: 'Label is required' }}
            render={(field) => (
              <Input
                {...field}
                autoFocus={!group}
                placeholder={t('enter-label')}
                className={CONTENT_PANEL_INPUT_CLASS_NAME}
              />
            )}
          />
          <ContentPanelFormField
            control={form.control}
            name="code"
            label={t('code')}
            render={(field) => (
              <Input
                {...field}
                placeholder={t('enter-code-group-eg')}
                className={CONTENT_PANEL_INPUT_CLASS_NAME}
              />
            )}
          />
          <ContentPanelFormField
            control={form.control}
            name="customPostTypeIds"
            label={t('show-on')}
            block
            icon={IconEye}
            render={(field) => (
              <>
                <span className="text-xs text-muted-foreground">
                  {t('show-on-desc')}
                </span>
                <MultipleSelector
                  value={pickOptions(showOnOptions, field.value || [])}
                  options={showOnOptions}
                  placeholder={t('show-on-placeholder')}
                  emptyIndicator={t('no-options')}
                  commandProps={getSearchableCommandProps(showOnOptions)}
                  onChange={(selected) =>
                    field.onChange(selected.map((option) => option.value))
                  }
                />
              </>
            )}
          />
          {showOnIds.includes('page') && (
            <ContentPanelFormField
              control={form.control}
              name="enabledPageId"
              label={t('specific-page-desc')}
              block
              icon={IconFile}
              render={(field) => (
                <MultipleSelector
                  value={pickOptions(pages, field.value ? [field.value] : [])}
                  options={pages}
                  placeholder={t('all-pages')}
                  emptyIndicator={t('no-pages-found')}
                  hidePlaceholderWhenSelected
                  commandProps={getSearchableCommandProps(pages)}
                  onChange={(selected) =>
                    field.onChange(selected[selected.length - 1]?.value || '')
                  }
                />
              )}
            />
          )}
          {showOnIds.includes('category') && (
            <ContentPanelFormField
              control={form.control}
              name="enabledCategoryIds"
              label={t('specific-categories-desc')}
              block
              icon={IconCategory}
              render={(field) => (
                <MultipleSelector
                  value={pickOptions(categories, field.value || [])}
                  options={categories}
                  placeholder={t('all-categories')}
                  emptyIndicator={t('no-categories-found')}
                  commandProps={getSearchableCommandProps(categories)}
                  onChange={(selected) =>
                    field.onChange(selected.map((option) => option.value))
                  }
                />
              )}
            />
          )}
          {showOnIds.includes('post') && (
            <ContentPanelFormField
              control={form.control}
              name="enabledPostIds"
              label={t('specific-posts-desc')}
              block
              icon={IconArticle}
              render={(field) => (
                <MultipleSelector
                  value={pickOptions(posts, field.value || [])}
                  options={posts}
                  placeholder={t('all-posts')}
                  emptyIndicator={t('no-posts-found')}
                  commandProps={getSearchableCommandProps(posts)}
                  onChange={(selected) =>
                    field.onChange(selected.map((option) => option.value))
                  }
                />
              )}
            />
          )}
        </PanelFormLayout>
      </form>
    </Form>
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
  const { group, loading, error } = useFieldGroupDetail(contentId);
  const [editGroup, { loading: saving }] = useEditFieldGroup();

  return (
    <ContentPanelRecordState
      loading={loading}
      hasRecord={!!group}
      error={error}
    >
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

const FIELD_FORM_DEFAULT_VALUES: FieldFormValues = {
  label: '',
  code: '',
  type: 'text',
  description: '',
  isRequired: false,
  options: '',
};

const toFieldFormValues = (field?: ICustomField): FieldFormValues =>
  field
    ? {
        label: field.label,
        code: field.code,
        type: field.type,
        description: field.description || '',
        isRequired: field.isRequired || false,
        options: field.options ? field.options.join(', ') : '',
      }
    : FIELD_FORM_DEFAULT_VALUES;

const FIELD_TYPES_WITH_OPTIONS = ['select', 'multiSelect', 'radio'];

const CustomFieldPanelForm = ({
  field,
  saving,
  onCancel,
  onSubmit,
}: {
  field?: ICustomField;
  saving: boolean;
  onCancel: () => void;
  onSubmit: (data: FieldFormValues) => void;
}) => {
  const { t } = useTranslation('content');
  const form = useForm<FieldFormValues>({
    defaultValues: toFieldFormValues(field),
  });

  useEffect(() => {
    form.reset(toFieldFormValues(field));
  }, [field, form]);

  const needsOptions = FIELD_TYPES_WITH_OPTIONS.includes(form.watch('type'));

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-1 min-h-0 flex-col"
      >
        <PanelFormLayout
          onCancel={onCancel}
          saving={saving}
          saveLabel={field ? t('update') : t('create')}
        >
          <ContentPanelFormField
            control={form.control}
            name="label"
            label={t('label')}
            required
            rules={{ required: 'Label is required' }}
            render={(inputField) => (
              <Input
                {...inputField}
                autoFocus={!field}
                placeholder={t('enter-field-label')}
                className={CONTENT_PANEL_INPUT_CLASS_NAME}
              />
            )}
          />
          <ContentPanelFormField
            control={form.control}
            name="code"
            label={t('code')}
            render={(inputField) => (
              <Input
                {...inputField}
                placeholder={t('enter-code-field-eg')}
                className={CONTENT_PANEL_INPUT_CLASS_NAME}
              />
            )}
          />
          <ContentPanelFormField
            control={form.control}
            name="type"
            label={t('field-type')}
            required
            rules={{ required: 'Type is required' }}
            render={(inputField) => (
              <Select
                value={inputField.value || ''}
                onValueChange={inputField.onChange}
              >
                <Select.Trigger className={CONTENT_PANEL_INPUT_CLASS_NAME}>
                  <Select.Value placeholder={t('select-field-type')} />
                </Select.Trigger>
                <Select.Content>
                  {FIELD_TYPES.map((type) => (
                    <Select.Item
                      key={type.value}
                      value={type.value}
                      className="h-7 text-xs"
                    >
                      <div className="flex items-center gap-2 [&_svg]:size-4">
                        {type.icon}
                        {type.label}
                      </div>
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            )}
          />
          {needsOptions && (
            <ContentPanelFormField
              control={form.control}
              name="options"
              label={t('options')}
              required
              rules={{ required: 'Options are required for this field type' }}
              render={(inputField) => (
                <Input
                  {...inputField}
                  placeholder={t('options-placeholder')}
                  className={CONTENT_PANEL_INPUT_CLASS_NAME}
                />
              )}
            />
          )}
          <ContentPanelFormField
            control={form.control}
            name="isRequired"
            label={t('required-field')}
            render={(inputField) => (
              <div className="flex h-7 items-center">
                <Switch
                  checked={inputField.value}
                  onCheckedChange={inputField.onChange}
                />
              </div>
            )}
          />
          <ContentPanelFormField
            control={form.control}
            name="description"
            label={t('description')}
            block
            render={(inputField) => (
              <Textarea
                {...inputField}
                placeholder={t('optional-description')}
                className="text-xs"
              />
            )}
          />
        </PanelFormLayout>
      </form>
    </Form>
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
      <CustomFieldPanelForm
        onCancel={cancelDraft}
        onSubmit={handleSubmit}
        saving={saving}
      />
    </ContentPanelRecordState>
  );
};

const CustomFieldPanelDetail = ({ contentId }: IContentPanelViewProps) => {
  const { t } = useTranslation('content');
  const { closePanel } = useContentPanel(CMS_CUSTOM_FIELD_CONTENT_TYPE);
  const { groupId, fieldId } = parseCustomFieldPanelId(contentId);
  const { group, loading, error } = useFieldGroupDetail(groupId);
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
    <ContentPanelRecordState
      loading={loading}
      hasRecord={!!field}
      error={error}
    >
      {field && (
        <CustomFieldPanelForm
          key={field._id}
          field={field}
          onCancel={closePanel}
          onSubmit={handleSubmit}
          saving={saving}
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

const useFieldGroupHeadingQuery = (groupId: string) => {
  const { data } = useQuery(CMS_CUSTOM_FIELD_GROUP_DETAIL, {
    variables: { _id: groupId },
    skip: !groupId,
  });
  const group: ICustomFieldGroup | undefined = data?.cmsCustomFieldGroup;

  return group;
};

const useFieldGroupPanelHeading = (contentId: string) => {
  const group = useFieldGroupHeadingQuery(contentId);

  return { name: group?.label };
};

const useCustomFieldPanelHeading = (contentId: string) => {
  const { groupId, fieldId } = parseCustomFieldPanelId(contentId);
  const group = useFieldGroupHeadingQuery(groupId);
  const field = group && getGroupFields(group).find((f) => f._id === fieldId);

  return { name: field?.label };
};

export const FIELD_GROUP_PANEL: IContentPanelViews = {
  addLabel: 'add-field-group',
  editLabel: 'edit-field-group',
  New: FieldGroupPanelNew,
  useHeading: useFieldGroupPanelHeading,
  Detail: FieldGroupPanelDetail,
  Actions: FieldGroupPanelActions,
};

export const CUSTOM_FIELD_PANEL: IContentPanelViews = {
  addLabel: 'add-field',
  editLabel: 'edit-field',
  New: CustomFieldPanelNew,
  useHeading: useCustomFieldPanelHeading,
  Detail: CustomFieldPanelDetail,
  Actions: CustomFieldPanelActions,
};

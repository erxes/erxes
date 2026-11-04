import { Form, Input, toast } from 'erxes-ui';
import { useMutation, useQuery } from '@apollo/client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  CMS_CUSTOM_POST_TYPE_ADD,
  CMS_CUSTOM_POST_TYPE_EDIT,
} from '../graphql/queries';
import {
  ContentPanelBody,
  ContentPanelFooter,
  ContentPanelRecordState,
} from '@/cms/shared/side-panel/ContentPanelLayout';
import { ContentPanelRemoveAction } from '@/cms/shared/side-panel/ContentPanelRemoveAction';
import {
  CMS_CUSTOM_TYPE_CONTENT_TYPE,
  IContentPanelViewProps,
  IContentPanelViews,
} from '@/cms/shared/side-panel/contentPanelTypes';
import {
  useContentPanel,
  useContentPanelDraft,
} from '@/cms/shared/side-panel/useContentPanel';
import { CMS_CUSTOM_POST_TYPE_DETAIL } from './graphql/queries';
import { CMS_CUSTOM_POST_TYPE_REMOVE } from './graphql/mutations';
import { ICustomPostType } from './types/customTypeTypes';

interface CustomTypePanelFormProps {
  clientPortalId: string;
  customType?: ICustomPostType;
  onCancel: () => void;
  onCreated?: (customTypeId: string) => void;
  onUpdated?: () => void;
}

interface CustomTypeFormData {
  label: string;
  pluralLabel: string;
  description?: string;
  code: string;
  clientPortalId?: string;
}

const CUSTOM_TYPE_REFETCH_QUERIES = ['cmsCustomPostTypes'];

const CustomTypePanelForm = ({
  clientPortalId,
  customType,
  onCancel,
  onCreated,
  onUpdated,
}: CustomTypePanelFormProps) => {
  const { t } = useTranslation('content');
  const isEditing = !!customType;

  const [addCustomPostType, { loading: creating }] = useMutation(
    CMS_CUSTOM_POST_TYPE_ADD,
    { refetchQueries: CUSTOM_TYPE_REFETCH_QUERIES },
  );

  const [editCustomPostType, { loading: updating }] = useMutation(
    CMS_CUSTOM_POST_TYPE_EDIT,
    { refetchQueries: CUSTOM_TYPE_REFETCH_QUERIES },
  );
  const form = useForm<CustomTypeFormData>({
    defaultValues: {
      label: '',
      pluralLabel: '',
      description: '',
      code: '',
      clientPortalId,
    },
  });

  useEffect(() => {
    form.reset({
      label: customType?.label || '',
      pluralLabel: customType?.pluralLabel || '',
      description: customType?.description || '',
      code: customType?.code || '',
      clientPortalId,
    });
  }, [form, clientPortalId, customType]);

  const generateCode = (label: string) =>
    label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/(^_|_$)/g, '');

  const handleLabelChange = (label: string) => {
    const code = generateCode(label);
    form.setValue('code', code);
    const currentPlural = form.getValues('pluralLabel');
    if (!currentPlural) form.setValue('pluralLabel', label);
  };

  const onSubmit = async (data: CustomTypeFormData) => {
    const input = {
      clientPortalId: data.clientPortalId,
      code: data.code,
      label: data.label,
      pluralLabel: data.pluralLabel,
      description: data.description,
    };

    try {
      if (isEditing && customType?._id) {
        await editCustomPostType({
          variables: { _id: customType._id, input },
        });
        toast({ title: t('custom-type-updated') });
        onUpdated?.();
      } else {
        const result = await addCustomPostType({ variables: { input } });
        toast({ title: t('custom-type-created') });
        const createdId = result.data?.cmsCustomPostTypesAdd?._id;

        if (createdId) {
          onCreated?.(createdId);
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      let pretty = msg || t('failed-to-create');
      if (/duplicate key/i.test(msg) || /already exists/i.test(msg)) {
        pretty = t('custom-type-code-already-exists');
      }
      if (/invalid characters/i.test(msg)) {
        pretty = t('custom-type-code-invalid-chars');
      }
      if (/system post type/i.test(msg)) {
        pretty = t('custom-type-reserved-code');
      }
      toast({ title: t('error'), description: pretty, variant: 'destructive' });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-1 min-h-0 flex-col"
      >
        <ContentPanelBody>
          <Form.Field
            control={form.control}
            name="label"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('label')}</Form.Label>
                <Form.Control>
                  <Input
                    {...field}
                    autoFocus={!isEditing}
                    placeholder={t('enter-label')}
                    required
                    onChange={(e) => {
                      field.onChange(e);
                      handleLabelChange(e.target.value);
                    }}
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={form.control}
            name="pluralLabel"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('plural-label')}</Form.Label>
                <Form.Control>
                  <Input
                    {...field}
                    placeholder={t('enter-plural-label')}
                    required
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={form.control}
            name="description"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('description')}</Form.Label>
                <Form.Control>
                  <Input {...field} placeholder={t('optional-description')} />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={form.control}
            name="code"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('key')}</Form.Label>
                <Form.Control>
                  <Input {...field} placeholder="custom_type_key" required />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
        </ContentPanelBody>
        <ContentPanelFooter
          onCancel={onCancel}
          saving={creating || updating}
          submitLabel={isEditing ? t('save-changes') : t('create')}
        />
      </form>
    </Form>
  );
};

const CustomTypePanelNew = () => {
  const { clientPortalId } = useContentPanelDraft(CMS_CUSTOM_TYPE_CONTENT_TYPE);
  const { openDetail, cancelDraft } = useContentPanel(
    CMS_CUSTOM_TYPE_CONTENT_TYPE,
  );

  return (
    <CustomTypePanelForm
      key={clientPortalId}
      clientPortalId={clientPortalId}
      onCancel={cancelDraft}
      onCreated={(customTypeId) =>
        openDetail(customTypeId, { replace: true })
      }
    />
  );
};

const CustomTypePanelDetail = ({ contentId }: IContentPanelViewProps) => {
  const { closePanel } = useContentPanel(CMS_CUSTOM_TYPE_CONTENT_TYPE);
  const { data, loading } = useQuery(CMS_CUSTOM_POST_TYPE_DETAIL, {
    variables: { _id: contentId },
    fetchPolicy: 'network-only',
  });
  const customType: (ICustomPostType & { clientPortalId: string }) | undefined =
    data?.cmsCustomPostType;

  return (
    <ContentPanelRecordState loading={loading} hasRecord={!!customType}>
      {customType && (
        <CustomTypePanelForm
          key={customType._id}
          customType={customType}
          clientPortalId={customType.clientPortalId}
          onCancel={closePanel}
          onUpdated={closePanel}
        />
      )}
    </ContentPanelRecordState>
  );
};

const CustomTypePanelActions = ({ contentId }: IContentPanelViewProps) => {
  const { t } = useTranslation('content');
  const [removeType, { loading }] = useMutation(CMS_CUSTOM_POST_TYPE_REMOVE, {
    refetchQueries: CUSTOM_TYPE_REFETCH_QUERIES,
  });

  return (
    <ContentPanelRemoveAction
      message={t('confirm-delete-this-custom-type')}
      loading={loading}
      onRemove={(onCompleted) =>
        removeType({
          variables: { _id: contentId },
          onCompleted: () => {
            toast({
              title: t('success'),
              description: t('custom-type-deleted'),
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

export const CUSTOM_TYPE_PANEL: IContentPanelViews = {
  addLabel: 'new-custom-type',
  editLabel: 'edit-custom-type',
  New: CustomTypePanelNew,
  Detail: CustomTypePanelDetail,
  Actions: CustomTypePanelActions,
};

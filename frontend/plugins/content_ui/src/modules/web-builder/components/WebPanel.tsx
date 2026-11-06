import { useQuery } from '@apollo/client';
import { Form, Input, Select, Textarea } from 'erxes-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { GET_WEB_LIST } from '../graphql/queries/getWebList';
import { useCreateWeb } from '../hooks/useCreateWeb';
import { useEditWeb } from '../hooks/useEditWeb';
import { useGetClientPortals } from '../hooks/useGetClientPortals';
import { useGetWebList } from '../hooks/useGetWebList';
import { useRemoveWeb } from '../hooks/useRemoveWeb';
import { IWeb, IWebInput, IWebThumbnail } from '../types';
import { TEMPLATE_TYPES } from '../constants';
import { TemplateSelect } from './TemplateSelect';
import { WebCustomDomain } from './WebCustomDomain';
import { Uploader } from '@/cms/settings/components/Uploader';
import {
  IconCategory,
  IconDeviceDesktop,
  IconPhoto,
  IconTemplate,
} from '@tabler/icons-react';
import { PanelFormLayout } from 'ui-modules';
import {
  CONTENT_PANEL_INPUT_CLASS_NAME,
  ContentPanelFormField,
} from '@/cms/shared/side-panel/ContentPanelForm';
import { ContentPanelRecordState } from '@/cms/shared/side-panel/ContentPanelLayout';
import { ContentPanelRemoveAction } from '@/cms/shared/side-panel/ContentPanelRemoveAction';
import {
  CONTENT_WEB_CONTENT_TYPE,
  IContentPanelViewProps,
  IContentPanelViews,
} from '@/cms/shared/side-panel/contentPanelTypes';
import { useContentPanel } from '@/cms/shared/side-panel/useContentPanel';

const webFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  description: z.string().optional(),
  domain: z.string().trim().optional(),
  templateType: z.string().min(1, 'Template type is required'),
  templateId: z.string().min(1, 'Template is required'),
  clientPortalId: z.string().min(1, 'Client portal is required'),
  thumbnail: z.custom<IWebThumbnail | null>().optional(),
});

type WebFormValues = z.infer<typeof webFormSchema>;

interface SelectOption {
  value: string;
  label: string;
}

const PanelSelect = ({
  options,
  value,
  onChange,
  placeholder,
}: {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) => (
  <Select value={value} onValueChange={onChange}>
    <Select.Trigger className={CONTENT_PANEL_INPUT_CLASS_NAME}>
      <Select.Value placeholder={placeholder} />
    </Select.Trigger>
    <Select.Content align="start">
      {options.map((option) => (
        <Select.Item
          key={option.value}
          value={option.value}
          className="h-7 text-xs"
        >
          {option.label}
        </Select.Item>
      ))}
    </Select.Content>
  </Select>
);

const WebPanelForm = ({
  web,
  onCancel,
  onCreated,
  onUpdated,
}: {
  web?: IWeb;
  onCancel: () => void;
  onCreated?: (webId: string) => void;
  onUpdated?: () => void;
}) => {
  const { t } = useTranslation('content');
  const { createWeb, loading: creating } = useCreateWeb();
  const { editWeb, loading: updating } = useEditWeb();
  const { portals } = useGetClientPortals();

  const isEditing = !!web;
  const form = useForm<WebFormValues>({
    resolver: zodResolver(webFormSchema),
    defaultValues: {
      name: '',
      description: '',
      domain: '',
      templateType: '',
      templateId: '',
      clientPortalId: '',
      thumbnail: null,
    },
  });

  useEffect(() => {
    form.reset({
      name: web?.name || '',
      description: web?.description || '',
      domain: web?.domain || '',
      templateType: web?.templateType || '',
      templateId: web?.templateId || '',
      clientPortalId: web?.clientPortalId || '',
      thumbnail: web?.thumbnail?.url ? web.thumbnail : null,
    });
  }, [web, form]);

  const onSubmit = async ({ thumbnail, ...rest }: WebFormValues) => {
    const data: IWebInput = {
      ...rest,
      thumbnail: thumbnail?.url
        ? {
            url: thumbnail.url,
            name: thumbnail.name,
            type: thumbnail.type,
            size: thumbnail.size,
            duration: thumbnail.duration,
          }
        : null,
    };

    if (web) {
      const result = await editWeb({ variables: { id: web._id, doc: data } });

      if (!result.errors) {
        onUpdated?.();
      }
      return;
    }

    const result = await createWeb({ variables: { doc: data } });
    const createdId = result.data?.createWeb?._id;

    if (createdId) {
      onCreated?.(createdId);
    }
  };

  const selectedType = form.watch('templateType');

  const portalOptions: SelectOption[] = portals.map((p) => ({
    value: p._id,
    label: p.name,
  }));

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-1 min-h-0 flex-col"
      >
        <PanelFormLayout
          onCancel={onCancel}
          saving={creating || updating}
          saveLabel={isEditing ? t('save-changes') : t('create')}
        >
          <ContentPanelFormField
            control={form.control}
            name="name"
            label={t('name')}
            required
            render={(field) => (
              <Input
                {...field}
                autoFocus={!isEditing}
                placeholder={t('my-website')}
                className={CONTENT_PANEL_INPUT_CLASS_NAME}
              />
            )}
          />

          <ContentPanelFormField
            control={form.control}
            name="clientPortalId"
            label={t('client-portal')}
            required
            icon={IconDeviceDesktop}
            render={(field) => (
              <PanelSelect
                options={portalOptions}
                value={field.value || ''}
                onChange={field.onChange}
                placeholder={t('select-a-client-portal')}
              />
            )}
          />

          <ContentPanelFormField
            control={form.control}
            name="domain"
            label={t('domain')}
            render={(field) => (
              <Input
                {...field}
                value={field.value || ''}
                placeholder="example.com"
                className={CONTENT_PANEL_INPUT_CLASS_NAME}
              />
            )}
          />

          <ContentPanelFormField
            control={form.control}
            name="templateType"
            label={t('template-type')}
            required
            icon={IconCategory}
            render={(field) => (
              <PanelSelect
                options={TEMPLATE_TYPES}
                value={field.value || ''}
                onChange={(value) => {
                  field.onChange(value);
                  form.setValue('templateId', '');
                }}
                placeholder={t('select-a-template-type')}
              />
            )}
          />

          <ContentPanelFormField
            control={form.control}
            name="templateId"
            label={t('template')}
            required
            block
            icon={IconTemplate}
            render={(field) => (
              <TemplateSelect
                type={selectedType || ''}
                value={field.value || ''}
                onChange={field.onChange}
              />
            )}
          />

          <ContentPanelFormField
            control={form.control}
            name="description"
            label={t('description')}
            block
            render={(field) => (
              <Textarea
                {...field}
                value={field.value || ''}
                placeholder={t('optional-description')}
                className="min-h-20 text-xs"
              />
            )}
          />

          <ContentPanelFormField
            control={form.control}
            name="thumbnail"
            label={t('thumbnail')}
            block
            render={(field) => (
              <Uploader
                icon={IconPhoto}
                label={t('thumbnail')}
                hint={t('thumbnail-hint', {
                  defaultValue: 'Shown on the web project card',
                })}
                value={
                  field.value?.url
                    ? {
                        ...field.value,
                        url: field.value.url,
                        name: field.value.name || '',
                      }
                    : null
                }
                onChange={field.onChange}
              />
            )}
          />

          {web && (
            <div className="pt-2">
              <WebCustomDomain webId={web._id} />
            </div>
          )}
        </PanelFormLayout>
      </form>
    </Form>
  );
};

const useWebRecord = (webId: string) => {
  const { webs, loading, error } = useGetWebList();

  return { web: webs.find((item) => item._id === webId), loading, error };
};

const WebPanelNew = () => {
  const { openDetail, cancelDraft } = useContentPanel(CONTENT_WEB_CONTENT_TYPE);

  return (
    <WebPanelForm
      onCancel={cancelDraft}
      onCreated={(webId) => openDetail(webId, { replace: true })}
    />
  );
};

const WebPanelDetail = ({ contentId }: IContentPanelViewProps) => {
  const { closePanel } = useContentPanel(CONTENT_WEB_CONTENT_TYPE);
  const { web, loading, error } = useWebRecord(contentId);

  return (
    <ContentPanelRecordState loading={loading} hasRecord={!!web} error={error}>
      {web && (
        <WebPanelForm
          key={web._id}
          web={web}
          onCancel={closePanel}
          onUpdated={closePanel}
        />
      )}
    </ContentPanelRecordState>
  );
};

const WebPanelActions = ({ contentId }: IContentPanelViewProps) => {
  const { t } = useTranslation('content');
  const { web } = useWebRecord(contentId);
  const { removeWeb, loading } = useRemoveWeb();

  return (
    <ContentPanelRemoveAction
      message={t('confirm-delete-web', { name: web?.name || '' })}
      loading={loading}
      onRemove={(onCompleted) =>
        removeWeb(contentId).then((result) => {
          if (!result.errors) {
            onCompleted();
          }
        })
      }
    />
  );
};

const useWebPanelHeading = (contentId: string) => {
  const { data } = useQuery<{ getWebList?: IWeb[] }>(GET_WEB_LIST);
  const web = data?.getWebList?.find((item) => item._id === contentId);

  return { name: web?.name, image: web?.thumbnail?.url };
};

export const WEB_PANEL: IContentPanelViews = {
  addLabel: 'new-web-project',
  editLabel: 'edit-web-project',
  New: WebPanelNew,
  useHeading: useWebPanelHeading,
  Detail: WebPanelDetail,
  Actions: WebPanelActions,
};

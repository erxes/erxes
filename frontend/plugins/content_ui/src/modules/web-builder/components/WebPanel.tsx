import { Form, Input, Select, Textarea } from 'erxes-ui';
import { ReactNode, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useCreateWeb } from '../hooks/useCreateWeb';
import { useEditWeb } from '../hooks/useEditWeb';
import { useGetClientPortals } from '../hooks/useGetClientPortals';
import { useGetWebList } from '../hooks/useGetWebList';
import { useRemoveWeb } from '../hooks/useRemoveWeb';
import { IWeb, IWebInput } from '../types';
import { TEMPLATE_TYPES } from '../constants';
import { TemplateSelect } from './TemplateSelect';
import { WebCustomDomain } from './WebCustomDomain';
import { Uploader } from '@/cms/settings/components/Uploader';
import { IconPhoto } from '@tabler/icons-react';
import {
  PANEL_INPUT_CLASS_NAME,
  PanelFormLayout,
  PanelFormRow,
} from 'ui-modules';
import { ContentPanelRecordState } from '@/cms/shared/side-panel/ContentPanelLayout';
import { ContentPanelRemoveAction } from '@/cms/shared/side-panel/ContentPanelRemoveAction';
import {
  CONTENT_WEB_CONTENT_TYPE,
  IContentPanelViewProps,
  IContentPanelViews,
} from '@/cms/shared/side-panel/contentPanelTypes';
import { useContentPanel } from '@/cms/shared/side-panel/useContentPanel';

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
    <Select.Trigger className={PANEL_INPUT_CLASS_NAME}>
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

const PanelFormBlock = ({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) => (
  <div className="flex flex-col gap-1.5 pt-2">
    <span className="text-xs font-medium text-accent-foreground">
      {label}
      {required && <span className="text-destructive"> *</span>}
    </span>
    {children}
    {error && <span className="text-xs text-destructive">{error}</span>}
  </div>
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
  const form = useForm<IWebInput>({
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

  const onSubmit = async ({ thumbnail, ...rest }: IWebInput) => {
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

  const { errors } = form.formState;

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
          <PanelFormRow label={t('name')} required error={errors.name?.message}>
            <Input
              {...form.register('name', { required: 'Name is required' })}
              autoFocus={!isEditing}
              placeholder={t('my-website')}
              className={PANEL_INPUT_CLASS_NAME}
            />
          </PanelFormRow>

          <PanelFormRow
            label={t('client-portal')}
            required
            error={errors.clientPortalId?.message}
          >
            <Form.Field
              control={form.control}
              name="clientPortalId"
              rules={{ required: 'Client portal is required' }}
              render={({ field }) => (
                <PanelSelect
                  options={portalOptions}
                  value={field.value || ''}
                  onChange={field.onChange}
                  placeholder={t('select-a-client-portal')}
                />
              )}
            />
          </PanelFormRow>

          <PanelFormRow label={t('domain')}>
            <Input
              {...form.register('domain')}
              placeholder="example.com"
              className={PANEL_INPUT_CLASS_NAME}
            />
          </PanelFormRow>

          <PanelFormRow
            label={t('template-type')}
            required
            error={errors.templateType?.message}
          >
            <Form.Field
              control={form.control}
              name="templateType"
              rules={{ required: 'Template type is required' }}
              render={({ field }) => (
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
          </PanelFormRow>

          <PanelFormBlock
            label={t('template')}
            required
            error={errors.templateId?.message}
          >
            <Form.Field
              control={form.control}
              name="templateId"
              rules={{ required: 'Template is required' }}
              render={({ field }) => (
                <TemplateSelect
                  type={selectedType || ''}
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              )}
            />
          </PanelFormBlock>

          <PanelFormBlock label={t('description')}>
            <Textarea
              {...form.register('description')}
              placeholder={t('optional-description')}
              className="min-h-20 text-xs"
            />
          </PanelFormBlock>

          <PanelFormBlock label={t('thumbnail')}>
            <Form.Field
              control={form.control}
              name="thumbnail"
              render={({ field }) => (
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
          </PanelFormBlock>

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
  const { webs, loading } = useGetWebList();

  return { web: webs.find((item) => item._id === webId), loading };
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
  const { web, loading } = useWebRecord(contentId);

  return (
    <ContentPanelRecordState loading={loading} hasRecord={!!web}>
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

export const WEB_PANEL: IContentPanelViews = {
  addLabel: 'new-web-project',
  editLabel: 'edit-web-project',
  New: WebPanelNew,
  Detail: WebPanelDetail,
  Actions: WebPanelActions,
};

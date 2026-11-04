import {
  Combobox,
  Command,
  Form,
  Input,
  Popover,
  Textarea,
} from 'erxes-ui';
import { useEffect, useState } from 'react';
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
  ContentPanelBody,
  ContentPanelFooter,
  ContentPanelRecordState,
} from '@/cms/shared/side-panel/ContentPanelLayout';
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

const FormComboSelect = ({
  options,
  value,
  onChange,
  placeholder,
}: {
  options: SelectOption[];
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) => {
  const [open, setOpen] = useState(false);
  const label = options.find((o) => o.value === value)?.label;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Form.Control>
        <Combobox.Trigger className="w-full shadow-xs">
          <span className={label ? '' : 'text-muted-foreground'}>
            {label || placeholder}
          </span>
        </Combobox.Trigger>
      </Form.Control>
      <Combobox.Content>
        <Command>
          <Command.List>
            {options.map((opt) => (
              <Command.Item
                key={opt.value}
                value={opt.value}
                onSelect={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                {opt.label}
                <Combobox.Check checked={value === opt.value} />
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

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

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-1 min-h-0 flex-col"
      >
        <ContentPanelBody>
          <Form.Field
            control={form.control}
            name="name"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('name')}</Form.Label>
                <Form.Control>
                  <Input
                    {...field}
                    placeholder={t('my-website')}
                    required
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={form.control}
            name="clientPortalId"
            rules={{ required: 'Client portal is required' }}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>
                  {t('client-portal')}{' '}
                  <span className="text-destructive">*</span>
                </Form.Label>
                <FormComboSelect
                  options={portalOptions}
                  value={field.value || ''}
                  onChange={field.onChange}
                  placeholder={t('select-a-client-portal')}
                />
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
                  <Textarea
                    {...field}
                    placeholder={t('optional-description')}
                    rows={3}
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={form.control}
            name="domain"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('domain')}</Form.Label>
                <Form.Control>
                  <Input {...field} placeholder="example.com" />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={form.control}
            name="templateType"
            rules={{ required: 'Template type is required' }}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>
                  {t('template-type')}{' '}
                  <span className="text-destructive">*</span>
                </Form.Label>
                <FormComboSelect
                  options={TEMPLATE_TYPES}
                  value={field.value || ''}
                  onChange={(v) => {
                    field.onChange(v);
                    form.setValue('templateId', '');
                  }}
                  placeholder={t('select-a-template-type')}
                />
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={form.control}
            name="templateId"
            rules={{ required: 'Template is required' }}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>
                  {t('template')}{' '}
                  <span className="text-destructive">*</span>
                </Form.Label>
                <TemplateSelect
                  type={selectedType || ''}
                  value={field.value || ''}
                  onChange={field.onChange}
                />
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={form.control}
            name="thumbnail"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('thumbnail')}</Form.Label>
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
                <Form.Message />
              </Form.Item>
            )}
          />

          {web && <WebCustomDomain webId={web._id} />}
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

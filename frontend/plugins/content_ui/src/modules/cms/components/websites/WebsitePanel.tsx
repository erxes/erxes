import { useMutation, useQuery } from '@apollo/client';
import {
  Form,
  Input,
  Select,
  Textarea,
  toast,
  MultipleSelector,
} from 'erxes-ui';
import {
  useEffect,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconDeviceDesktop, IconLanguage } from '@tabler/icons-react';
import { PanelFormLayout } from 'ui-modules';
import { CONTENT_CMS_LIST, GET_WEBSITES } from '../../graphql/queries';
import {
  CONTENT_CREATE_CMS,
  CONTENT_UPDATE_CMS,
} from '../../graphql/mutations';
import { useClientPortals } from '../../hooks/useClientPortals';
import { LANGUAGES } from '../../../../constants';
import {
  websiteFormSchema,
  WebsiteFormType,
} from '../../constants/websiteFormSchema';
import { IWebsite } from '../../types';
import {
  CONTENT_PANEL_INPUT_CLASS_NAME,
  ContentPanelFormField,
} from '@/cms/shared/side-panel/ContentPanelForm';
import { ContentPanelRecordState } from '@/cms/shared/side-panel/ContentPanelLayout';
import {
  CMS_WEBSITE_CONTENT_TYPE,
  IContentPanelViewProps,
  IContentPanelViews,
} from '@/cms/shared/side-panel/contentPanelTypes';
import { useContentPanel } from '@/cms/shared/side-panel/useContentPanel';

interface WebsitePanelFormProps {
  website?: IWebsite;
  onCancel: () => void;
  onCreated?: (websiteId: string) => void;
  onUpdated?: () => void;
}

const WEBSITE_REFETCH_QUERIES = [{ query: GET_WEBSITES }, 'ContentCMSList'];

const WebsitePanelForm = ({
  website,
  onCancel,
  onCreated,
  onUpdated,
}: WebsitePanelFormProps) => {
  const { t } = useTranslation('content');
  const isEditing = !!website;
  const languagesSelectorRef = useRef<HTMLDivElement>(null);
  const defaultLanguageTriggerRef = useRef<HTMLButtonElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const {
    clientPortals,
    loading: clientPortalsLoading,
    refetch: refetchClientPortals,
  } = useClientPortals({}, false);

  const { data: cmsData } = useQuery<{ contentCMSList: IWebsite[] }>(
    CONTENT_CMS_LIST,
    { fetchPolicy: 'cache-first' },
  );

  // CMS routes are keyed by clientPortalId, so two CMSes on one portal would
  // both open whichever CMS the list returns first.
  const portalOwnerNames = new Map<string, string>();
  for (const cms of cmsData?.contentCMSList || []) {
    if (cms.clientPortalId && cms._id !== website?._id) {
      portalOwnerNames.set(cms.clientPortalId, cms.name);
    }
  }

  const form = useForm<WebsiteFormType>({
    resolver: zodResolver(websiteFormSchema),
    defaultValues: {
      name: '',
      description: '',
      domain: '',
      url: '',
      kind: '',
      languages: [],
      language: '',
    },
  });

  useEffect(() => {
    refetchClientPortals();

    if (website) {
      form.reset({
        name: website.name || '',
        description: website.description || '',
        domain: website.domain || '',
        url: website.url || '',
        kind: website.clientPortalId || '',
        languages: website.languages || [],
        language: website.language || '',
      });
    } else {
      form.reset({
        name: '',
        description: '',
        domain: '',
        url: '',
        kind: '',
        languages: [],
        language: '',
      });
    }
  }, [website, form, refetchClientPortals]);

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'languages') {
        const selected = (value.languages || []) as string[];
        const current = (value.language || '') as string;
        if (!current && selected.length > 0) {
          form.setValue('language', selected[0], { shouldDirty: true });
        } else if (
          current &&
          selected.length > 0 &&
          !selected.includes(current)
        ) {
          form.setValue('language', selected[0], { shouldDirty: true });
        } else if (selected.length === 0 && current) {
          form.setValue('language', '', { shouldDirty: true });
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const [createCMS, { loading: saving }] = useMutation(CONTENT_CREATE_CMS, {
    refetchQueries: WEBSITE_REFETCH_QUERIES,
    awaitRefetchQueries: true,
    onCompleted: (data) => {
      if (data?.contentCreateCMS?._id) {
        onCreated?.(data.contentCreateCMS._id);
      }
      toast({
        title: t('success'),
        description: t('cms-created-successfully'),
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: t('error'),
        description: error.message || t('failed-to-create-cms'),
        variant: 'destructive',
        duration: 5000,
      });
    },
  });

  const [updateCMS, { loading: savingUpdate }] = useMutation(
    CONTENT_UPDATE_CMS,
    {
      refetchQueries: WEBSITE_REFETCH_QUERIES,
      awaitRefetchQueries: true,
      onCompleted: () => {
        onUpdated?.();
        toast({
          title: t('success'),
          description: t('cms-updated-successfully'),
          variant: 'default',
        });
      },
      onError: (error) => {
        toast({
          title: t('error'),
          description: error.message || t('failed-to-update-cms'),
          variant: 'destructive',
          duration: 5000,
        });
      },
    },
  );

  const onSubmit = (data: WebsiteFormType) => {
    const { name, description, language, languages } = data;

    // A legacy CMS may keep its stored portal so editing it never moves content.
    const portalChanged = !isEditing || data.kind !== website?.clientPortalId;

    if (portalChanged) {
      if (!clientPortals.some((portal) => portal._id === data.kind)) {
        form.setError('kind', {
          message: t('select-client-portal'),
        });
        return;
      }

      const ownerName = portalOwnerNames.get(data.kind);

      if (ownerName) {
        form.setError('kind', {
          message: t('cms-client-portal-in-use', {
            defaultValue: 'This client portal is already used by {{name}}',
            name: ownerName,
          }),
        });
        return;
      }
    }

    if (isEditing && website?._id) {
      updateCMS({
        variables: {
          id: website._id,
          input: {
            name,
            description,
            language: language || undefined,
            languages: languages || [],
            clientPortalId: data.kind,
          },
        },
      });
      return;
    }

    createCMS({
      variables: {
        input: {
          name,
          description,
          language: language || undefined,
          languages: languages || [],
          clientPortalId: data.kind,
          content: 'hello',
        },
      },
    });
  };

  const focusAfterLanguagesSelector = () => {
    const defaultLanguageTrigger = defaultLanguageTriggerRef.current;

    if (defaultLanguageTrigger && !defaultLanguageTrigger.disabled) {
      defaultLanguageTrigger.focus();
      return;
    }

    const saveButton = formRef.current?.querySelector<HTMLButtonElement>(
      'button[type="submit"]',
    );

    if (saveButton && !saveButton.disabled) {
      saveButton.focus();
      return;
    }

    const buttons =
      formRef.current?.querySelectorAll<HTMLButtonElement>(
        'button[type="button"]',
      ) || [];

    buttons[buttons.length - 1]?.focus();
  };

  const handleLanguagesSelectorKeyDownCapture = (
    event: ReactKeyboardEvent<HTMLDivElement>,
  ) => {
    if (event.key !== 'Tab' || event.shiftKey) {
      return;
    }

    const selectorEl = languagesSelectorRef.current;
    if (!selectorEl) return;

    const focusable = Array.from(
      selectorEl.querySelectorAll<HTMLElement>(
        'a[href]:not([disabled]), button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    );
    const lastFocusable = focusable[focusable.length - 1];

    if (event.target instanceof HTMLElement && event.target === lastFocusable) {
      event.preventDefault();
      focusAfterLanguagesSelector();
    }
  };

  const selectedLanguages = form.watch('languages') || [];
  const availableLanguages = LANGUAGES.filter((l) =>
    selectedLanguages.includes(l.value),
  );

  return (
    <Form {...form}>
      <form
        ref={formRef}
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-1 min-h-0 flex-col"
      >
        <PanelFormLayout
          onCancel={onCancel}
          saving={saving || savingUpdate}
          saveLabel={isEditing ? t('save-changes') : t('create-cms')}
        >
          <ContentPanelFormField
            control={form.control}
            name="name"
            label={t('cms-name')}
            required
            render={(field) => (
              <Input
                {...field}
                autoFocus={!isEditing}
                placeholder={t('enter-website-name')}
                className={CONTENT_PANEL_INPUT_CLASS_NAME}
              />
            )}
          />

          <ContentPanelFormField
            control={form.control}
            name="kind"
            label={t('client-portal')}
            required
            icon={IconDeviceDesktop}
            render={(field) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={clientPortalsLoading}
              >
                <Select.Trigger className={CONTENT_PANEL_INPUT_CLASS_NAME}>
                  <Select.Value
                    placeholder={
                      clientPortalsLoading
                        ? t('loading')
                        : t('select-client-portal')
                    }
                  />
                </Select.Trigger>
                <Select.Content align="start">
                  {clientPortals.map((portal) => {
                    const ownerName = portalOwnerNames.get(portal._id);

                    return (
                      <Select.Item
                        key={portal._id}
                        value={portal._id}
                        disabled={Boolean(ownerName)}
                        className="h-7 text-xs"
                      >
                        {ownerName
                          ? t('cms-client-portal-used-by', {
                              defaultValue: '{{portal}} (used by {{name}})',
                              portal: portal.name,
                              name: ownerName,
                            })
                          : portal.name}
                      </Select.Item>
                    );
                  })}
                </Select.Content>
              </Select>
            )}
          />

          <ContentPanelFormField
            control={form.control}
            name="languages"
            label={t('languages')}
            block
            icon={IconLanguage}
            render={(field) => (
              <div
                ref={languagesSelectorRef}
                onKeyDownCapture={handleLanguagesSelectorKeyDownCapture}
              >
                <MultipleSelector
                  defaultOptions={LANGUAGES}
                  onSearchSync={(term) =>
                    LANGUAGES.filter(
                      (o) =>
                        o.label.toLowerCase().includes(term.toLowerCase()) ||
                        o.value.toLowerCase().includes(term.toLowerCase()),
                    )
                  }
                  triggerSearchOnFocus
                  value={(field.value || []).map((lng) => ({
                    value: lng,
                    label: LANGUAGES.find((l) => l.value === lng)?.label || lng,
                  }))}
                  onChange={(val) => field.onChange(val.map((v) => v.value))}
                  placeholder={t('select-languages')}
                  commandProps={{ shouldFilter: false }}
                  className="text-xs"
                />
              </div>
            )}
          />

          <ContentPanelFormField
            control={form.control}
            name="language"
            label={t('default-language')}
            icon={IconLanguage}
            render={(field) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={availableLanguages.length === 0}
              >
                <Select.Trigger
                  ref={defaultLanguageTriggerRef}
                  className={CONTENT_PANEL_INPUT_CLASS_NAME}
                >
                  <Select.Value placeholder={t('select-default-language')} />
                </Select.Trigger>
                <Select.Content align="start">
                  {availableLanguages.map((opt) => (
                    <Select.Item
                      key={opt.value}
                      value={opt.value}
                      className="h-7 text-xs"
                    >
                      {opt.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            )}
          />

          <ContentPanelFormField
            control={form.control}
            name="description"
            label={t('description')}
            required
            block
            render={(field) => (
              <Textarea
                {...field}
                placeholder={t('enter-website-description')}
                className="min-h-24 text-xs"
              />
            )}
          />
        </PanelFormLayout>
      </form>
    </Form>
  );
};

const WebsitePanelNew = () => {
  const { openDetail, cancelDraft } = useContentPanel(CMS_WEBSITE_CONTENT_TYPE);

  return (
    <WebsitePanelForm
      onCancel={cancelDraft}
      onCreated={(websiteId) => openDetail(websiteId, { replace: true })}
    />
  );
};

const WebsitePanelDetail = ({ contentId }: IContentPanelViewProps) => {
  const { closePanel } = useContentPanel(CMS_WEBSITE_CONTENT_TYPE);
  const { data, loading, error } = useQuery<{ contentCMSList: IWebsite[] }>(
    CONTENT_CMS_LIST,
    { fetchPolicy: 'cache-first' },
  );
  const website = data?.contentCMSList?.find((cms) => cms._id === contentId);

  return (
    <ContentPanelRecordState
      loading={loading}
      hasRecord={!!website}
      error={error}
    >
      {website && (
        <WebsitePanelForm
          key={website._id}
          website={website}
          onCancel={closePanel}
          onUpdated={closePanel}
        />
      )}
    </ContentPanelRecordState>
  );
};

const useWebsitePanelHeading = (contentId: string) => {
  const { data } = useQuery<{ contentCMSList: IWebsite[] }>(CONTENT_CMS_LIST);

  return {
    name: data?.contentCMSList?.find((cms) => cms._id === contentId)?.name,
  };
};

export const WEBSITE_PANEL: IContentPanelViews = {
  addLabel: 'new-cms',
  editLabel: 'edit-cms',
  New: WebsitePanelNew,
  useHeading: useWebsitePanelHeading,
  Detail: WebsitePanelDetail,
};

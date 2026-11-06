import { useMutation, useQuery } from '@apollo/client';
import { IconAlertCircle, IconExternalLink } from '@tabler/icons-react';
import { Checkbox, Form, Input, Select, Spinner, toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { PanelFormLayout } from 'ui-modules';
import { CMS_MENU_REMOVE } from '../graphql/queries';
import { CmsSavedRowLoadError } from '../shared/components/CmsSavedRowLoadError';
import {
  CONTENT_PANEL_INPUT_CLASS_NAME,
  ContentPanelFormField,
  ContentPanelLanguageRow,
} from '@/cms/shared/side-panel/ContentPanelForm';
import { ContentPanelRecordState } from '@/cms/shared/side-panel/ContentPanelLayout';
import { ContentPanelRemoveAction } from '@/cms/shared/side-panel/ContentPanelRemoveAction';
import {
  CMS_MENU_CONTENT_TYPE,
  IContentPanelViewProps,
  IContentPanelViews,
} from '@/cms/shared/side-panel/contentPanelTypes';
import {
  useContentPanel,
  useContentPanelDraft,
  useContentPanelWebsiteId,
} from '@/cms/shared/side-panel/useContentPanel';
import { MenuLinkField } from './components/MenuLinkField';
import { CMS_MENU_DETAIL } from './graphql/menuDetailQuery';
import { useMenuDrawer } from './hooks/useMenuDrawer';
import {
  MenuFormData,
  MenuPanelFormProps,
  MenuRecord,
} from './types/menuDrawerTypes';

const MenuPanelForm = (props: MenuPanelFormProps) => {
  const { t } = useTranslation('content');

  const {
    form,
    isEditing,
    hasPermissionError,
    saving,
    savedRowLoad,
    selectedLanguage,
    isTranslationMode,
    languageOptions,
    availableLanguages,
    onLanguageChange,
    onSubmit,
    linkType,
    isCustomType,
    isPostType,
    customTypes,
    pages,
    posts,
    categories,
    tags,
    parentOptions,
  } = useMenuDrawer(props);

  const handleSubmit = (data: MenuFormData) => {
    if (hasPermissionError || savedRowLoad.isBlocked) return;
    onSubmit(data);
  };

  const sharedAcrossLanguages = isTranslationMode && (
    <span className="ml-2 text-xs text-gray-500">
      ({t('shared-across-languages')})
    </span>
  );

  if (savedRowLoad.hasFailed) {
    return (
      <div className="p-3">
        <CmsSavedRowLoadError onRetry={savedRowLoad.retry} />
      </div>
    );
  }

  if (savedRowLoad.isBlocked) {
    return <Spinner containerClassName="py-12" />;
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-1 min-h-0 flex-col"
      >
        <PanelFormLayout
          onCancel={props.onCancel}
          saving={saving}
          saveLabel={isEditing ? t('save-changes') : t('create-menu')}
        >
          {hasPermissionError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <IconAlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-red-800">
                    {t('permission-required')}
                  </p>
                  <p className="text-red-700 mt-1">
                    {t('menus-permission-required-desc')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {availableLanguages.length > 0 && (
            <ContentPanelLanguageRow
              selectedLanguage={selectedLanguage}
              languageOptions={languageOptions}
              onLanguageChange={onLanguageChange}
            />
          )}

          <ContentPanelFormField
            control={form.control}
            name="label"
            required
            label={
              <>
                {t('label')}
                {isTranslationMode && (
                  <span className="ml-2 text-xs text-blue-600">
                    ({selectedLanguage})
                  </span>
                )}
              </>
            }
            render={(field) => (
              <Input
                {...field}
                className={CONTENT_PANEL_INPUT_CLASS_NAME}
                placeholder={t('enter-label')}
                required
              />
            )}
          />

          <MenuLinkField
            form={form}
            linkType={linkType}
            isTranslationMode={isTranslationMode}
            isCustomType={isCustomType}
            isPostType={isPostType}
            customTypes={customTypes}
            pages={pages}
            posts={posts}
            categories={categories}
            tags={tags}
          />

          <ContentPanelFormField
            control={form.control}
            name="target"
            icon={IconExternalLink}
            label={t('open-in-new-tab')}
            render={(field) => (
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />

          <ContentPanelFormField
            control={form.control}
            name="kind"
            label={
              <>
                {t('kind')}
                {sharedAcrossLanguages}
              </>
            }
            render={(field) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <Select.Trigger className={CONTENT_PANEL_INPUT_CLASS_NAME}>
                  <Select.Value placeholder={t('select-kind')} />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="header">{t('header')}</Select.Item>
                  <Select.Item value="footer">{t('footer')}</Select.Item>
                </Select.Content>
              </Select>
            )}
          />

          <ContentPanelFormField
            control={form.control}
            name="parentId"
            label={
              <>
                {t('parent-menu')}
                {sharedAcrossLanguages}
              </>
            }
            render={(field) => (
              <Select
                value={field.value || 'none'}
                onValueChange={field.onChange}
              >
                <Select.Trigger className={CONTENT_PANEL_INPUT_CLASS_NAME}>
                  <Select.Value placeholder={t('none-top-level')} />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="none">{t('none-top-level')}</Select.Item>
                  {parentOptions.map((opt) => (
                    <Select.Item key={opt._id} value={opt._id}>
                      {opt.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            )}
          />
        </PanelFormLayout>
      </form>
    </Form>
  );
};

const MenuPanelNew = () => {
  const { clientPortalId } = useContentPanelDraft(CMS_MENU_CONTENT_TYPE);
  const { openDetail, cancelDraft } = useContentPanel(CMS_MENU_CONTENT_TYPE);

  return (
    <MenuPanelForm
      key={clientPortalId}
      clientPortalId={clientPortalId}
      onCancel={cancelDraft}
      onCreated={(menuId) => openDetail(menuId, { replace: true })}
    />
  );
};

const MenuPanelDetail = ({ contentId }: IContentPanelViewProps) => {
  const { closePanel } = useContentPanel(CMS_MENU_CONTENT_TYPE);
  const clientPortalId = useContentPanelWebsiteId();
  const { data, loading, error } = useQuery(CMS_MENU_DETAIL, {
    variables: { _id: contentId, clientPortalId },
    fetchPolicy: 'network-only',
    skip: !clientPortalId,
  });
  const menu: (MenuRecord & { clientPortalId: string }) | undefined =
    data?.cmsMenu;

  return (
    <ContentPanelRecordState loading={loading} hasRecord={!!menu} error={error}>
      {menu && (
        <MenuPanelForm
          key={menu._id}
          menu={menu}
          clientPortalId={menu.clientPortalId}
          onCancel={closePanel}
          onUpdated={closePanel}
        />
      )}
    </ContentPanelRecordState>
  );
};

const MenuPanelActions = ({ contentId }: IContentPanelViewProps) => {
  const { t } = useTranslation('content');
  const [removeMenu, { loading }] = useMutation(CMS_MENU_REMOVE, {
    refetchQueries: ['cmsMenuList'],
  });

  return (
    <ContentPanelRemoveAction
      message={t('confirm-delete-menu')}
      loading={loading}
      onRemove={(onCompleted) =>
        removeMenu({
          variables: { _id: contentId },
          onCompleted: () => {
            toast({ title: t('success') });
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

const useMenuPanelHeading = (contentId: string) => {
  const clientPortalId = useContentPanelWebsiteId();
  const { data } = useQuery<{ cmsMenu?: MenuRecord }>(CMS_MENU_DETAIL, {
    variables: { _id: contentId, clientPortalId },
    skip: !clientPortalId,
  });

  return { name: data?.cmsMenu?.label };
};

export const MENU_PANEL: IContentPanelViews = {
  addLabel: 'new-menu',
  editLabel: 'edit-menu',
  New: MenuPanelNew,
  useHeading: useMenuPanelHeading,
  Detail: MenuPanelDetail,
  Actions: MenuPanelActions,
};

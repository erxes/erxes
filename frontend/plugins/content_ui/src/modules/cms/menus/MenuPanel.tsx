import { useMutation, useQuery } from '@apollo/client';
import { IconAlertCircle } from '@tabler/icons-react';
import { Checkbox, Form, Input, Select, toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { CMS_MENU_REMOVE } from '../graphql/queries';
import { LanguageSelector } from '../shared/LanguageSelector';
import { CmsSavedRowLoadError } from '../shared/components/CmsSavedRowLoadError';
import {
  ContentPanelBody,
  ContentPanelFooter,
  ContentPanelRecordState,
} from '@/cms/shared/side-panel/ContentPanelLayout';
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
import { MenuPanelFormProps, MenuRecord } from './types/menuDrawerTypes';

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

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-1 min-h-0 flex-col"
      >
        <ContentPanelBody>
          {savedRowLoad.hasFailed && (
            <CmsSavedRowLoadError onRetry={savedRowLoad.retry} />
          )}
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
            <LanguageSelector
              selectedLanguage={selectedLanguage}
              languageOptions={languageOptions}
              onLanguageChange={onLanguageChange}
            />
          )}

          <Form.Field
            control={form.control}
            name="label"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>
                  {t('label')}
                  {isTranslationMode && (
                    <span className="ml-2 text-xs text-blue-600">
                      ({selectedLanguage})
                    </span>
                  )}
                </Form.Label>
                <Form.Control>
                  <Input {...field} placeholder={t('enter-label')} required />
                </Form.Control>
                <Form.Message />
              </Form.Item>
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

          <Form.Field
            control={form.control}
            name="target"
            render={({ field }) => (
              <Form.Item>
                <div className="flex items-center gap-2">
                  <Form.Control>
                    <Checkbox
                      id="target-blank"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </Form.Control>
                  <Form.Label
                    htmlFor="target-blank"
                    className="cursor-pointer font-normal"
                  >
                    {t('open-in-new-tab')}
                  </Form.Label>
                </div>
              </Form.Item>
            )}
          />

          <Form.Field
            control={form.control}
            name="kind"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>
                  {t('kind')}
                  {isTranslationMode && (
                    <span className="ml-2 text-xs text-gray-500">
                      ({t('shared-across-languages')})
                    </span>
                  )}
                </Form.Label>
                <Form.Control>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <Select.Trigger>
                      <Select.Value placeholder={t('select-kind')} />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Item value="header">{t('header')}</Select.Item>
                      <Select.Item value="footer">{t('footer')}</Select.Item>
                    </Select.Content>
                  </Select>
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={form.control}
            name="parentId"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>
                  {t('parent-menu')}
                  {isTranslationMode && (
                    <span className="ml-2 text-xs text-gray-500">
                      ({t('shared-across-languages')})
                    </span>
                  )}
                </Form.Label>
                <Form.Control>
                  <Select
                    value={field.value || 'none'}
                    onValueChange={field.onChange}
                  >
                    <Select.Trigger>
                      <Select.Value placeholder={t('none-top-level')} />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Item value="none">
                        {t('none-top-level')}
                      </Select.Item>
                      {parentOptions.map((opt) => (
                        <Select.Item key={opt._id} value={opt._id}>
                          {opt.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
        </ContentPanelBody>
        <ContentPanelFooter
          onCancel={props.onCancel}
          saving={saving}
          disabled={hasPermissionError || savedRowLoad.isBlocked}
          submitLabel={isEditing ? t('save-changes') : t('create-menu')}
        />
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
  const { data, loading } = useQuery(CMS_MENU_DETAIL, {
    variables: { _id: contentId, clientPortalId },
    fetchPolicy: 'network-only',
    skip: !clientPortalId,
  });
  const menu: (MenuRecord & { clientPortalId: string }) | undefined =
    data?.cmsMenu;

  return (
    <ContentPanelRecordState loading={loading} hasRecord={!!menu}>
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

export const MENU_PANEL: IContentPanelViews = {
  addLabel: 'new-menu',
  editLabel: 'edit-menu',
  New: MenuPanelNew,
  Detail: MenuPanelDetail,
  Actions: MenuPanelActions,
};

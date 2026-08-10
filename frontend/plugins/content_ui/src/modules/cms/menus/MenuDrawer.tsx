import { IconAlertCircle } from '@tabler/icons-react';
import { Button, Checkbox, Form, Input, Select, Sheet } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '../shared/LanguageSelector';
import { MenuLinkField } from './components/MenuLinkField';
import { useMenuDrawer } from './hooks/useMenuDrawer';
import { MenuDrawerProps } from './types/menuDrawerTypes';

export function MenuDrawer(props: MenuDrawerProps) {
  const { t } = useTranslation('content');
  const { isOpen, onClose } = props;

  const {
    form,
    isEditing,
    hasPermissionError,
    saving,
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
    <Sheet open={isOpen} onOpenChange={onClose}>
      <Sheet.View className="sm:max-w-lg p-0 bg-background">
        <Sheet.Header className="border-b gap-3">
          <Sheet.Title>{isEditing ? t('edit-menu') : t('new-menu')}</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 space-y-4">
            {hasPermissionError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <div className="flex items-start gap-2">
                  <IconAlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-red-800">{t('permission-required')}</p>
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
                      <span className="ml-2 text-xs text-blue-600">({selectedLanguage})</span>
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
                    <Form.Label htmlFor="target-blank" className="cursor-pointer font-normal">
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
                      <span className="ml-2 text-xs text-gray-500">({t('shared-across-languages')})</span>
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
                      <span className="ml-2 text-xs text-gray-500">({t('shared-across-languages')})</span>
                    )}
                  </Form.Label>
                  <Form.Control>
                    <Select value={field.value || 'none'} onValueChange={field.onChange}>
                      <Select.Trigger>
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
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button onClick={onClose} variant="outline">
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={saving || hasPermissionError}>
                {saving ? t('saving') : isEditing ? t('save-changes') : t('create-menu')}
              </Button>
            </div>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
}

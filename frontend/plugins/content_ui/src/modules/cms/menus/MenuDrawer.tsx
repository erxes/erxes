import { IconAlertCircle } from '@tabler/icons-react';
import { Button, Checkbox, Form, Input, Select, Sheet } from 'erxes-ui';
import { LanguageSelector } from '../shared/LanguageSelector';
import { MenuLinkField } from './components/MenuLinkField';
import { useMenuDrawer } from './hooks/useMenuDrawer';
import { MenuDrawerProps } from './types/menuDrawerTypes';

export function MenuDrawer(props: MenuDrawerProps) {
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
          <Sheet.Title>{isEditing ? 'Edit Menu' : 'New Menu'}</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 space-y-4">
            {hasPermissionError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <div className="flex items-start gap-2">
                  <IconAlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-red-800">Permission Required</p>
                    <p className="text-red-700 mt-1">
                      You need permission to manage menus. Please contact your administrator.
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
                    Label
                    {isTranslationMode && (
                      <span className="ml-2 text-xs text-blue-600">({selectedLanguage})</span>
                    )}
                  </Form.Label>
                  <Form.Control>
                    <Input {...field} placeholder="Enter label" required />
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
                      Open in new tab
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
                    Kind
                    {isTranslationMode && (
                      <span className="ml-2 text-xs text-gray-500">(shared across languages)</span>
                    )}
                  </Form.Label>
                  <Form.Control>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <Select.Trigger>
                        <Select.Value placeholder="Select kind" />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="header">Header</Select.Item>
                        <Select.Item value="footer">Footer</Select.Item>
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
                    Parent Menu
                    {isTranslationMode && (
                      <span className="ml-2 text-xs text-gray-500">(shared across languages)</span>
                    )}
                  </Form.Label>
                  <Form.Control>
                    <Select value={field.value || 'none'} onValueChange={field.onChange}>
                      <Select.Trigger>
                        <Select.Value placeholder="None (top-level)" />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="none">None (top-level)</Select.Item>
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
                Cancel
              </Button>
              <Button type="submit" disabled={saving || hasPermissionError}>
                {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Menu'}
              </Button>
            </div>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
}

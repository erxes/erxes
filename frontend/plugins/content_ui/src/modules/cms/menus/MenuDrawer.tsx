import { useMutation, useQuery } from '@apollo/client';
import { IconAlertCircle } from '@tabler/icons-react';
import { Button, Form, Input, Select, Sheet, toast } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  CMS_MENU_ADD,
  CMS_MENU_EDIT,
  CMS_MENU_LIST,
  CONTENT_CMS_LIST,
} from '../graphql/queries';
import { buildFlatTree, getDepthPrefix, RawMenuItem } from './menuUtils';
import { useCmsTranslation } from '../shared/hooks/useCmsTranslation';
import { LanguageSelector } from '../shared/LanguageSelector';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  clientPortalId: string;
  menu?: {
    _id: string;
    label: string;
    url?: string;
    kind?: string;
    parentId?: string;
  };
}

interface MenuFormData {
  label: string;
  url: string;
  kind: string;
  clientPortalId: string;
  parentId: string;
}

export function MenuDrawer({
  isOpen,
  onClose,
  onSuccess,
  clientPortalId,
  menu,
}: MenuDrawerProps) {
  const [hasPermissionError, setHasPermissionError] = useState(false);
  const isEditing = !!menu?._id;

  // Fetch CMS config for languages
  const { data: cmsData } = useQuery(CONTENT_CMS_LIST, {
    fetchPolicy: 'cache-first',
    skip: !clientPortalId,
  });

  const cmsConfig = cmsData?.contentCMSList?.find(
    (cms: any) => cms.clientPortalId === clientPortalId,
  );
  const availableLanguages: string[] = cmsConfig?.languages || [];
  const defaultLanguage: string = cmsConfig?.language || 'en';

  const {
    selectedLanguage,
    isTranslationMode,
    languageOptions,
    handleLanguageChange,
    defaultLangData,
    translations,
  } = useCmsTranslation({
    objectId: menu?._id,
    type: 'menu',
    availableLanguages,
    defaultLanguage,
  });

  const form = useForm<MenuFormData>({
    defaultValues: {
      label: '',
      url: '',
      kind: '',
      clientPortalId,
      parentId: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        label: menu?.label || '',
        url: menu?.url || '',
        kind: menu?.kind || '',
        clientPortalId,
        parentId: menu?.parentId || '',
      });
      setHasPermissionError(false);
    }
  }, [isOpen, clientPortalId, menu]);

  const { data: menusData } = useQuery(CMS_MENU_LIST, {
    variables: { clientPortalId, limit: 100 },
    skip: !isOpen || !clientPortalId,
    fetchPolicy: 'cache-and-network',
  });

  const rawMenus: RawMenuItem[] = (menusData?.cmsMenuList || []).filter(
    (m: RawMenuItem) => m._id !== menu?._id,
  );

  const parentOptions = buildFlatTree(rawMenus).map((item) => ({
    _id: item._id,
    label: getDepthPrefix(item.depth) + item.label,
  }));

  function handleError(error: any) {
    const permissionError = error.graphQLErrors?.some(
      (e: any) =>
        e.message === 'Permission required' ||
        e.extensions?.code === 'INTERNAL_SERVER_ERROR',
    );

    if (permissionError) {
      setHasPermissionError(true);
      toast({
        title: 'Permission Required',
        description:
          'You do not have permission to manage menus. Please contact your administrator.',
        variant: 'destructive',
        duration: 8000,
      });
    } else {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save menu. Please try again.',
        variant: 'destructive',
        duration: 5000,
      });
    }
  }

  const [addMenu, { loading: adding }] = useMutation(CMS_MENU_ADD, {
    onCompleted: () => {
      onClose();
      form.reset();
      onSuccess?.();
      toast({
        title: 'Success',
        description: 'Menu created successfully',
        variant: 'default',
      });
    },
    onError: handleError,
  });

  const [editMenu, { loading: editing }] = useMutation(CMS_MENU_EDIT, {
    onCompleted: () => {
      onClose();
      onSuccess?.();
      toast({
        title: 'Success',
        description: 'Menu updated successfully',
        variant: 'default',
      });
    },
    onError: handleError,
  });

  const saving = adding || editing;

  const onSubmit = (data: MenuFormData) => {
    const isNonDefaultLang =
      !!selectedLanguage &&
      !!defaultLanguage &&
      selectedLanguage !== defaultLanguage;
    const isCreating = !isEditing;

    const currentLabel = data.label;

    // For EDIT: backend uses label as translation title for non-default lang
    // For CREATE: no language routing, so swap to defaultLangData for main doc
    let mainLabel = currentLabel;

    if (isCreating && isNonDefaultLang) {
      if (defaultLangData) {
        mainLabel = defaultLangData.title || '';
      }
    }

    const input: Record<string, any> = {
      clientPortalId: data.clientPortalId,
      label: mainLabel,
      url: data.url,
      kind: data.kind,
    };

    if (data.parentId && data.parentId !== 'none') {
      input.parentId = data.parentId;
    }

    if (selectedLanguage) {
      // For create: send default language since main doc holds default lang data
      input.language = isCreating && isNonDefaultLang ? defaultLanguage : selectedLanguage;
    }

    // Build translations array
    if (defaultLanguage) {
      const translationEntries: any[] = [];

      for (const [lang, tData] of Object.entries(translations)) {
        if (lang === defaultLanguage) continue;
        // Skip current language — it will be added from current form data below
        if (lang === selectedLanguage) continue;
        if (tData.title) {
          translationEntries.push({
            language: lang,
            title: tData.title || '',
            type: 'menu',
          });
        }
      }

      if (isCreating && isNonDefaultLang) {
        translationEntries.push({
          language: selectedLanguage,
          title: currentLabel,
          type: 'menu',
        });
      }

      if (translationEntries.length > 0) {
        input.translations = translationEntries;
      }
    }

    if (isEditing) {
      editMenu({ variables: { _id: menu!._id, input } });
    } else {
      addMenu({ variables: { input } });
    }
  };

  /**
   * Language switch handler for menus.
   * Maps: label ↔ title in translations.
   */
  const onLanguageChange = (lang: string) => {
    handleLanguageChange(
      lang,
      () => ({
        title: form.getValues('label') || '',
      }),
      (data) => {
        form.setValue('label', data.title || '');
      },
      menu ? { title: menu.label || '' } : undefined,
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <Sheet.View className="sm:max-w-lg p-0">
        <Sheet.Header className="border-b gap-3">
          <Sheet.Title>{isEditing ? 'Edit Menu' : 'New Menu'}</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="p-4 space-y-4"
          >
            {hasPermissionError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <div className="flex items-start gap-2">
                  <IconAlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-red-800">
                      Permission Required
                    </p>
                    <p className="text-red-700 mt-1">
                      You need permission to manage menus. Please contact your
                      administrator.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Language selector */}
            {availableLanguages.length > 0 && (
              <LanguageSelector
                selectedLanguage={selectedLanguage}
                languageOptions={languageOptions}
                onLanguageChange={onLanguageChange}
              />
            )}

            {/* Label - translatable (stored as title in translations) */}
            <Form.Field
              control={form.control}
              name="label"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>
                    Label
                    {isTranslationMode && (
                      <span className="ml-2 text-xs text-blue-600">
                        ({selectedLanguage})
                      </span>
                    )}
                  </Form.Label>
                  <Form.Control>
                    <Input {...field} placeholder="Enter label" required />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            {/* URL - shared field */}
            <Form.Field
              control={form.control}
              name="url"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>
                    URL
                    {isTranslationMode && (
                      <span className="ml-2 text-xs text-gray-500">
                        (shared across languages)
                      </span>
                    )}
                  </Form.Label>
                  <Form.Control>
                    <Input
                      {...field}
                      placeholder="/path-or-https://..."
                      required
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            {/* Kind - shared field */}
            <Form.Field
              control={form.control}
              name="kind"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>
                    Kind
                    {isTranslationMode && (
                      <span className="ml-2 text-xs text-gray-500">
                        (shared across languages)
                      </span>
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

            {/* Parent menu - shared field */}
            <Form.Field
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>
                    Parent Menu
                    {isTranslationMode && (
                      <span className="ml-2 text-xs text-gray-500">
                        (shared across languages)
                      </span>
                    )}
                  </Form.Label>
                  <Form.Control>
                    <Select
                      value={field.value || 'none'}
                      onValueChange={field.onChange}
                    >
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
                {saving
                  ? 'Saving...'
                  : isEditing
                    ? 'Save Changes'
                    : 'Create Menu'}
              </Button>
            </div>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
}

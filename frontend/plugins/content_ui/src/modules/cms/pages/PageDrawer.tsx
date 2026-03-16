import { IconAlertCircle } from '@tabler/icons-react';
import { Button, Form, Input, Select, Textarea, toast } from 'erxes-ui';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@apollo/client';
import { useAddPage } from './hooks/useAddPage';
import { useEditPage } from './hooks/useEditPage';
import { IPageDrawerProps, IPageFormData } from './types/pageTypes';
import { CONTENT_CMS_LIST } from '../graphql/queries';
import { useCmsTranslation } from '../shared/hooks/useCmsTranslation';
import { LanguageSelector } from '../shared/LanguageSelector';

export function PageDrawer({
  page,
  onClose,
  clientPortalId,
}: IPageDrawerProps) {
  const isEditing = !!page;
  const [hasPermissionError, setHasPermissionError] = useState(false);

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
  } = useCmsTranslation({
    objectId: page?._id,
    type: 'page',
    availableLanguages,
    defaultLanguage,
  });

  const form = useForm<IPageFormData>({
    defaultValues: {
      name: '',
      path: '',
      description: '',
      status: 'active',
      clientPortalId,
    },
  });

  const { editPage, loading: savingEdit } = useEditPage();
  const { addPage, loading: savingAdd } = useAddPage();

  useEffect(() => {
    if (isEditing && page) {
      form.reset({
        name: page.name || '',
        path: page.slug || '',
        description: page.description || '',
        status: page.status || 'active',
        clientPortalId,
      });
    } else {
      form.reset({
        name: '',
        path: '',
        description: '',
        status: 'active',
        clientPortalId,
      });
    }
  }, [page, isEditing, clientPortalId, form]);

  const onCompleted = () => {
    onClose();
    form.reset();
    toast({
      title: 'Success',
      description: isEditing
        ? 'Page updated successfully.'
        : 'Page created successfully.',
      variant: 'default',
      duration: 3000,
    });
  };

  const onError = (error: any) => {
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
          'You do not have permission to perform this action. Please contact your administrator.',
        variant: 'destructive',
        duration: 8000,
      });
    } else {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save page. Please try again.',
        variant: 'destructive',
        duration: 5000,
      });
    }
  };

  const onSubmit = (data: IPageFormData) => {
    const input: Record<string, any> = {
      clientPortalId: data.clientPortalId,
      name: data.name,
      slug: data.path,
      description: data.description,
      status: data.status || 'active',
    };

    if (selectedLanguage && availableLanguages.length > 0) {
      input.language = selectedLanguage;
    }

    if (isEditing && page?._id) {
      editPage({ variables: { _id: page._id, input }, onCompleted, onError });
    } else {
      addPage({ variables: { input }, onCompleted, onError });
    }
  };

  /**
   * Language switch handler for pages.
   * Maps: name ↔ title, description ↔ content in translations.
   */
  const onLanguageChange = (lang: string) => {
    handleLanguageChange(
      lang,
      () => ({
        title: form.getValues('name') || '',
        content: form.getValues('description') || '',
      }),
      (data) => {
        form.setValue('name', data.title || '');
        form.setValue('description', data.content || '');
      },
      page
        ? { title: page.name || '', content: page.description || '' }
        : undefined,
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 space-y-4">
        {hasPermissionError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <IconAlertCircle className="h-5 w-5 text-red-500 mt-0.5 " />
              <div className="text-sm">
                <p className="font-medium text-red-800">Permission Required</p>
                <p className="text-red-700 mt-1">
                  You need permission to create or edit pages. Please contact
                  your administrator to grant this permission.
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

        {/* Name - translatable (stored as title in translations) */}
        <Form.Field
          control={form.control}
          name="name"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>
                Name
                {isTranslationMode && (
                  <span className="ml-2 text-xs text-blue-600">
                    ({selectedLanguage})
                  </span>
                )}
              </Form.Label>
              <Form.Control>
                <Input {...field} placeholder="Enter name" required />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />

        {/* Path - shared field */}
        <Form.Field
          control={form.control}
          name="path"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>
                Path
                {isTranslationMode && (
                  <span className="ml-2 text-xs text-gray-500">
                    (shared across languages)
                  </span>
                )}
              </Form.Label>
              <Form.Control>
                <Input {...field} placeholder="/about-us" required />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />

        {/* Description - translatable (stored as content in translations) */}
        <Form.Field
          control={form.control}
          name="description"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>
                Description
                {isTranslationMode && (
                  <span className="ml-2 text-xs text-blue-600">
                    ({selectedLanguage})
                  </span>
                )}
              </Form.Label>
              <Form.Control>
                <Textarea {...field} placeholder="Enter description" rows={4} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />

        {/* Status - shared field */}
        <Form.Field
          control={form.control}
          name="status"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>
                Status
                {isTranslationMode && (
                  <span className="ml-2 text-xs text-gray-500">
                    (shared across languages)
                  </span>
                )}
              </Form.Label>
              <Form.Control>
                <Select
                  {...field}
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <Select.Trigger>
                    <Select.Value placeholder="Select status" />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="active">active</Select.Item>
                    <Select.Item value="inactive">inactive</Select.Item>
                  </Select.Content>
                </Select>
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button
            type="submit"
            disabled={hasPermissionError || savingAdd || savingEdit}
          >
            {savingAdd || savingEdit
              ? isEditing
                ? 'Saving...'
                : 'Creating...'
              : isEditing
                ? 'Save Changes'
                : 'Create Page'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

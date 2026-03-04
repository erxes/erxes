import { useMutation } from '@apollo/client';
import { IconAlertCircle } from '@tabler/icons-react';
import {
  Button,
  Form,
  Input,
  Select,
  Sheet,
  Textarea,
  Upload,
  toast,
  MultipleSelector,
} from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { CLIENT_PORTAL_REMOVE } from '../../graphql/queries';
import { GET_WEBSITES } from '../../graphql/queries';
import {
  CONTENT_CREATE_CMS,
  CONTENT_UPDATE_CMS,
  CONTENT_DELETE_CMS,
} from '../../graphql/mutations';
import { useClientPortals } from '../../hooks/useClientPortals';
import { LANGUAGES } from '../../../../constants';

interface Website {
  _id: string;
  name: string;
  description: string;
  domain: string;
  url: string;
  kind?: string;
  clientPortalId: string;
  createdAt: string;
  languages?: string[];
  language?: string;
}

interface WebsiteDrawerProps {
  website?: Website;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface WebsiteFormData {
  name: string;
  description: string;
  domain: string;
  url: string;
  kind: string;
  languages: string[];
  language: string;
}

export function WebsiteDrawer({
  website,
  isOpen,
  onClose,
  onSuccess,
}: WebsiteDrawerProps) {
  const isEditing = !!website;
  const [hasPermissionError, setHasPermissionError] = useState(false);

  const {
    clientPortals,
    totalCount,
    pageInfo,
    loading: clientPortalsLoading,
    error: clientPortalsError,
    refetch: refetchClientPortals,
  } = useClientPortals({}, !isOpen);

  const form = useForm<WebsiteFormData>({
    defaultValues: {
      name: '',
      description: '',
      kind: 'client',
      languages: [],
      language: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
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
          kind: 'client',
          languages: [],
          language: '',
        });
      }
      setHasPermissionError(false);
    }
  }, [website, form, isOpen, refetchClientPortals]);

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
    refetchQueries: [{ query: GET_WEBSITES }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      onClose();
      form.reset();
      if (onSuccess) {
        onSuccess();
      }
      toast({
        title: 'Success',
        description: 'CMS created successfully',
        variant: 'default',
      });
    },
    onError: (error) => {
      const permissionError = error.graphQLErrors?.some(
        (e) =>
          e.message === 'Permission required' ||
          e.extensions?.code === 'INTERNAL_SERVER_ERROR',
      );

      if (permissionError) {
        setHasPermissionError(true);
        toast({
          title: 'Permission Required',
          description:
            'You do not have permission to create CMS. Please contact your administrator.',
          variant: 'destructive',
          duration: 8000,
        });
      } else {
        toast({
          title: 'Error',
          description:
            error.message || 'Failed to create CMS. Please try again.',
          variant: 'destructive',
          duration: 5000,
        });
      }
    },
  });

  const [updateCMS, { loading: savingUpdate }] = useMutation(
    CONTENT_UPDATE_CMS,
    {
      refetchQueries: [{ query: GET_WEBSITES }],
      awaitRefetchQueries: true,
      onCompleted: () => {
        onClose();
        form.reset();
        if (onSuccess) {
          onSuccess();
        }
        toast({
          title: 'Success',
          description: 'CMS updated successfully',
          variant: 'default',
        });
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description:
            error.message || 'Failed to update CMS. Please try again.',
          variant: 'destructive',
          duration: 5000,
        });
      },
    },
  );

  const [deleteCMS, { loading: removing }] = useMutation(CONTENT_DELETE_CMS, {
    refetchQueries: [{ query: GET_WEBSITES }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      onClose();
      form.reset();
      toast({
        title: 'Success',
        description: 'CMS deleted successfully',
        variant: 'default',
      });
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete CMS. Please try again.',
        variant: 'destructive',
        duration: 5000,
      });
    },
  });

  const onSubmit = (data: WebsiteFormData) => {
    const { name, description, language, languages } = data;

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

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <Sheet.View className="sm:max-w-lg p-0">
        <Sheet.Header className="border-b gap-3">
          <Sheet.Title>{isEditing ? 'Edit CMS' : 'New CMS'}</Sheet.Title>
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
                      You need the "manageClientPortal" permission to create or
                      edit websites. Please contact your administrator to grant
                      this permission.
                    </p>
                  </div>
                </div>
              </div>
            )}
            <Form.Field
              control={form.control}
              name="name"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Cms Name</Form.Label>
                  <Form.Control>
                    <Input
                      {...field}
                      placeholder="Enter website name"
                      required
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="description"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Description</Form.Label>
                  <Form.Control>
                    <Textarea
                      {...field}
                      placeholder="Enter website description"
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="kind"
              render={({ field }) => {
                return (
                  <Form.Item>
                    <Form.Label>Client Portal</Form.Label>
                    <Form.Control>
                      <Select
                        {...field}
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={clientPortalsLoading}
                      >
                        <Select.Trigger>
                          <Select.Value
                            placeholder={
                              clientPortalsLoading
                                ? 'Loading...'
                                : 'Select client portal'
                            }
                          />
                        </Select.Trigger>
                        <Select.Content>
                          {clientPortals.map((portal) => (
                            <Select.Item key={portal._id} value={portal._id}>
                              {portal.name}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                );
              }}
            />

            <Form.Field
              control={form.control}
              name="languages"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Languages</Form.Label>
                  <Form.Control>
                    <MultipleSelector
                      defaultOptions={LANGUAGES}
                      onSearchSync={(term) =>
                        LANGUAGES.filter(
                          (o) =>
                            o.label
                              .toLowerCase()
                              .includes(term.toLowerCase()) ||
                            o.value.toLowerCase().includes(term.toLowerCase()),
                        )
                      }
                      triggerSearchOnFocus
                      value={(field.value || []).map((lng) => ({
                        value: lng,
                        label:
                          LANGUAGES.find((l) => l.value === lng)?.label || lng,
                      }))}
                      onChange={(val) =>
                        field.onChange(val.map((v) => v.value))
                      }
                      placeholder="Select languages"
                      commandProps={{ shouldFilter: false }}
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="language"
              render={({ field }) => {
                const selectedLanguages = form.watch('languages') || [];
                const available = LANGUAGES.filter((l) =>
                  selectedLanguages.includes(l.value),
                );
                return (
                  <Form.Item>
                    <Form.Label>Default Language</Form.Label>
                    <Form.Control>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={available.length === 0}
                      >
                        <Select.Trigger>
                          <Select.Value placeholder="Select default language" />
                        </Select.Trigger>
                        <Select.Content>
                          {available.map((opt) => (
                            <Select.Item key={opt.value} value={opt.value}>
                              {opt.label}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                );
              }}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="submit"
                disabled={saving || savingUpdate || hasPermissionError}
              >
                {saving || savingUpdate
                  ? isEditing
                    ? 'Saving...'
                    : 'Creating...'
                  : hasPermissionError
                    ? 'Permission Required'
                    : isEditing
                      ? 'Save Changes'
                      : 'Create CMS'}
              </Button>

              {isEditing && (
                <Button
                  variant="destructive"
                  type="button"
                  onClick={async () => {
                    if (website?._id) {
                      try {
                        await deleteCMS({ variables: { id: website._id } });
                      } catch (error) {}
                    }
                  }}
                  disabled={removing}
                >
                  {removing ? 'Deleting...' : 'Delete'}
                </Button>
              )}
              <Button onClick={onClose} variant="outline">
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
}

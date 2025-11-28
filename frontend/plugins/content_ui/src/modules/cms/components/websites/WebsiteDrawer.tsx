import { useMutation } from '@apollo/client';
import { IconUpload, IconAlertCircle } from '@tabler/icons-react';
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
import { CLIENT_PORTAL_CONFIG_UPDATE } from '../../graphql/queries';
import { CLIENT_PORTAL_REMOVE } from '../../graphql/queries';
import { GET_WEBSITES } from '../../graphql/queries';
import { SelectBrand } from 'ui-modules';
import { LANGUAGES } from '../../../../constants';

interface Website {
  _id: string;
  name: string;
  description: string;
  domain: string;
  url: string;
  kind: string;
  createdAt: string;
  languages?: string[];
  language?: string;
}

interface WebsiteDrawerProps {
  website?: Website;
  isOpen: boolean;
  onClose: () => void;
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
}: WebsiteDrawerProps) {
  const isEditing = !!website;
  const [hasPermissionError, setHasPermissionError] = useState(false);

  const form = useForm<WebsiteFormData>({
    defaultValues: {
      name: '',
      description: '',
      domain: '',
      url: '',
      kind: 'client',
      languages: [],
      language: '',
    },
  });

  useEffect(() => {
    if (website) {
      form.reset({
        name: website.name || '',
        description: website.description || '',
        domain: website.domain || '',
        url: website.url || '',
        kind: website.kind || 'client',
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
  }, [website, form, isOpen]);

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

  const [updateWebsite, { loading: saving }] = useMutation(
    CLIENT_PORTAL_CONFIG_UPDATE,
    {
      refetchQueries: [{ query: GET_WEBSITES, variables: { search: '' } }],
      awaitRefetchQueries: true,
      onCompleted: () => {
        onClose();
        form.reset();
        toast({
          title: 'Success',
          description: isEditing
            ? 'Website updated successfully'
            : 'Website created successfully',
          variant: 'default',
        });
      },
      onError: (error) => {
        console.error('Website update error:', error);

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
              'You do not have permission to manage websites. Please contact your administrator to grant the "manageClientPortal" permission.',
            variant: 'destructive',
            duration: 8000,
          });
        } else {
          toast({
            title: 'Error',
            description:
              error.message || 'Failed to save website. Please try again.',
            variant: 'destructive',
            duration: 5000,
          });
        }
      },
    },
  );

  const [removeWebsite, { loading: removing }] = useMutation(
    CLIENT_PORTAL_REMOVE,
    {
      refetchQueries: [{ query: GET_WEBSITES, variables: { search: '' } }],
      awaitRefetchQueries: true,
      onCompleted: () => {
        onClose();
        form.reset();
        toast({
          title: 'Success',
          description: 'Website deleted successfully',
          variant: 'default',
        });
      },
      onError: (error) => {
        console.error('Website delete error:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to delete website. Please try again.',
          variant: 'destructive',
          duration: 5000,
        });
      },
    },
  );

  const onSubmit = (data: WebsiteFormData) => {
    const { languages: _omitLanguages, ...rest } = data;
    const config = {
      _id: isEditing && website ? website._id : undefined,
      name: rest.name,
      description: rest.description,
      domain: rest.domain,
      url: rest.url,
      kind: rest.kind,
      language: rest.language || undefined,
    } as const;

    updateWebsite({
      variables: {
        config,
      },
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <Sheet.View className="sm:max-w-lg p-0">
        <Sheet.Header className="border-b gap-3">
          <Sheet.Title>
            {isEditing ? 'Edit Website' : 'New Website'}
          </Sheet.Title>
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
                  <Form.Label>Website Name</Form.Label>
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
              name="domain"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Domain</Form.Label>
                  <Form.Control>
                    <Input {...field} placeholder="example.com" />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="url"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>URL</Form.Label>
                  <Form.Control>
                    <Input
                      {...field}
                      placeholder="https://example.com"
                      type="url"
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="kind"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Type</Form.Label>
                  <Form.Control>
                    <Select
                      {...field}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <Select.Trigger>
                        <Select.Value placeholder="Select type" />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="client">Client Portal</Select.Item>
                        <Select.Item value="vendor">Vendor Portal</Select.Item>
                      </Select.Content>
                    </Select>
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
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
              {isEditing && (
                <Button
                  variant="destructive"
                  type="button"
                  disabled={removing}
                  onClick={async () => {
                    try {
                      await removeWebsite({ variables: { _id: website?._id } });
                    } catch {}
                  }}
                >
                  {removing ? 'Deleting...' : 'Delete'}
                </Button>
              )}
              <Button onClick={onClose} variant="outline">
                Cancel
              </Button>
              <Button type="submit" disabled={saving || hasPermissionError}>
                {saving
                  ? isEditing
                    ? 'Saving...'
                    : 'Creating...'
                  : hasPermissionError
                  ? 'Permission Required'
                  : isEditing
                  ? 'Save Changes'
                  : 'Create Website'}
              </Button>
            </div>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
}

import { Button, Form, Input, Sheet, toast } from 'erxes-ui';
import { useMutation } from '@apollo/client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  CMS_CUSTOM_POST_TYPE_ADD,
  CMS_CUSTOM_POST_TYPE_EDIT,
} from '../../graphql/queries';

interface CustomTypeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  clientPortalId?: string;
  customType?: any;
  onCreate?: (data: CustomTypeFormData) => Promise<void> | void;
  onUpdate?: () => Promise<void> | void;
}

interface CustomTypeFormData {
  label: string;
  pluralLabel: string;
  description?: string;
  code: string;
  clientPortalId?: string;
}

export function CustomTypeDrawer({
  isOpen,
  onClose,
  clientPortalId,
  customType,
  onCreate,
  onUpdate,
}: CustomTypeDrawerProps) {
  const { t } = useTranslation('content');
  const isEditing = !!customType;

  const [addCustomPostType, { loading: creating }] = useMutation(
    CMS_CUSTOM_POST_TYPE_ADD,
  );

  const [editCustomPostType, { loading: updating }] = useMutation(
    CMS_CUSTOM_POST_TYPE_EDIT,
  );
  const form = useForm<CustomTypeFormData>({
    defaultValues: {
      label: '',
      pluralLabel: '',
      description: '',
      code: '',
      clientPortalId,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (customType) {
        form.reset({
          label: customType.label || '',
          pluralLabel: customType.pluralLabel || '',
          description: customType.description || '',
          code: customType.code || '',
          clientPortalId,
        });
      } else {
        form.reset({
          label: '',
          pluralLabel: '',
          description: '',
          code: '',
          clientPortalId,
        });
      }
    }
  }, [form, isOpen, clientPortalId, customType]);

  const generateCode = (label: string) =>
    label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/(^_|_$)/g, '');

  const handleLabelChange = (label: string) => {
    const code = generateCode(label);
    form.setValue('code', code);
    const currentPlural = form.getValues('pluralLabel');
    if (!currentPlural) form.setValue('pluralLabel', label);
  };

  const onSubmit = async (data: CustomTypeFormData) => {
    try {
      if (isEditing && customType?._id) {
        await editCustomPostType({
          variables: {
            _id: customType._id,
            input: {
              clientPortalId: data.clientPortalId,
              code: data.code,
              label: data.label,
              pluralLabel: data.pluralLabel,
              description: data.description,
            },
          },
        });
        if (onUpdate) await onUpdate();
        toast({ title: t('custom-type-updated') });
      } else {
        await addCustomPostType({
          variables: {
            input: {
              clientPortalId: data.clientPortalId,
              code: data.code,
              label: data.label,
              pluralLabel: data.pluralLabel,
              description: data.description,
            },
          },
        });
        if (onCreate) await onCreate(data);
        toast({ title: t('custom-type-created') });
      }
      onClose();
    } catch (e: any) {
      const msg: string = e?.message || '';
      let pretty = msg || t('failed-to-create');
      if (/duplicate key/i.test(msg) || /already exists/i.test(msg)) {
        pretty = t('custom-type-code-already-exists');
      }
      if (/invalid characters/i.test(msg)) {
        pretty = t('custom-type-code-invalid-chars');
      }
      if (/system post type/i.test(msg)) {
        pretty = t('custom-type-reserved-code');
      }
      toast({ title: t('error'), description: pretty, variant: 'destructive' });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <Sheet.View className="sm:max-w-lg p-0 bg-background">
        <Sheet.Header className="border-b gap-3">
          <Sheet.Title>
            {isEditing ? t('edit-custom-type') : t('new-custom-type')}
          </Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="p-4 space-y-4"
          >
            <Form.Field
              control={form.control}
              name="label"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('label')}</Form.Label>
                  <Form.Control>
                    <Input
                      {...field}
                      placeholder={t('enter-label')}
                      required
                      onChange={(e) => {
                        field.onChange(e);
                        handleLabelChange(e.target.value);
                      }}
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="pluralLabel"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('plural-label')}</Form.Label>
                  <Form.Control>
                    <Input
                      {...field}
                      placeholder={t('enter-plural-label')}
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
                  <Form.Label>{t('description')}</Form.Label>
                  <Form.Control>
                    <Input {...field} placeholder={t('optional-description')} />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="code"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('key')}</Form.Label>
                  <Form.Control>
                    <Input {...field} placeholder="custom_type_key" required />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button onClick={onClose} variant="outline">
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={creating || updating}>
                {creating || updating
                  ? isEditing
                    ? t('saving')
                    : t('creating')
                  : isEditing
                  ? t('save-changes')
                  : t('create')}
              </Button>
            </div>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
}

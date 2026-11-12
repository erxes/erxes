import { zodResolver } from '@hookform/resolvers/zod';
import { IconPencil, IconPlus } from '@tabler/icons-react';
import { Button, Form, Input, Sheet, Spinner, Textarea } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  type IPropertyGroupForm,
  type IPropertyGroupValues,
  propertyGroupSchema,
} from '../propertySchema';

/** Old erxes's group form, in a sheet. */
export const PropertyGroupForm = ({
  isEdit,
  onSubmit,
  defaultValues,
  onCancel,
  loading,
  contentType,
}: {
  isEdit?: boolean;
  onSubmit: (data: IPropertyGroupValues) => void;
  loading: boolean;
  defaultValues: IPropertyGroupForm;
  onCancel: () => void;
  contentType: string;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });

  const form = useForm<IPropertyGroupForm, unknown, IPropertyGroupValues>({
    resolver: zodResolver(propertyGroupSchema),
    defaultValues,
  });

  return (
    <Form {...form}>
      <form
        onSubmit={(event) => {
          // A group added from inside the property form must not submit it.
          event.stopPropagation();
          void form.handleSubmit(onSubmit)(event);
        }}
        className="flex h-full w-full flex-col gap-0"
      >
        <Sheet.Header>
          <Sheet.Title className="flex items-center gap-1 text-lg text-foreground">
            {isEdit ? t('edit-group', 'Edit Group') : t('add-group', 'Add Group')}
          </Sheet.Title>
          <Sheet.Description className="sr-only">
            {t('group-description', 'Add a new group for the content type {{type}}', {
              type: contentType,
            })}
          </Sheet.Description>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="grow size-full h-auto flex flex-col px-5 py-4 gap-5">
          <Form.Field
            name="name"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('group-name', 'Group Name')}</Form.Label>
                <Form.Control>
                  <Input
                    {...field}
                    type="text"
                    placeholder={t('enter-group-name', 'Enter group name')}
                    autoFocus
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            name="code"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('code', 'Code')}</Form.Label>
                <Form.Control>
                  <Input
                    {...field}
                    value={field.value ?? ''}
                    type="text"
                    placeholder={t('enter-group-code', 'Enter group code')}
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            name="description"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('description', 'Description')}</Form.Label>
                <Form.Control>
                  <Textarea {...field} value={field.value ?? ''} />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
        </Sheet.Content>
        <Sheet.Footer>
          <Button type="button" variant="ghost" onClick={onCancel}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? <Spinner /> : isEdit ? <IconPencil /> : <IconPlus />}
            {isEdit ? t('update', 'Update') : t('create', 'Create')}
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
};

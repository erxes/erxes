import { Button, Form, Input, Sheet, Spinner, Switch } from 'erxes-ui';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { IPropertyGroupForm } from '../types/propertyFormTypes';
import { zodResolver } from '@hookform/resolvers/zod';
import { propertyGroupSchema } from '../propertySchema';
import { IconPencil, IconPlus } from '@tabler/icons-react';
export const PropertyGroupForm = ({
  isEdit,
  onSubmit,
  defaultValues,
  locked,
  onCancel,
  layout = 'sheet',
  loading,
  contentType,
}: {
  isEdit?: boolean;
  onSubmit: (data: IPropertyGroupForm) => void;
  loading: boolean;
  defaultValues: IPropertyGroupForm;
  onCancel: () => void;
  layout?: 'sheet' | 'record';
  // A plugin's group: only its name can change here.
  locked?: boolean;
  contentType: string;
}) => {
  const { t } = useTranslation('settings', {
    keyPrefix: 'properties',
  });
  const form = useForm<IPropertyGroupForm>({
    resolver: zodResolver(propertyGroupSchema),
    defaultValues,
  });
  const submitHandler: SubmitHandler<IPropertyGroupForm> = (data) => {
    onSubmit(data);
  };
  const Content = layout === 'record' ? 'div' : Sheet.Content;
  const Footer = layout === 'record' ? 'div' : Sheet.Footer;
  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.stopPropagation();
          form.handleSubmit(submitHandler)(e);
        }}
        className=" flex flex-col gap-0 w-full h-full"
      >
        {layout === 'sheet' && (
          <Sheet.Header>
            <Sheet.Title className="text-lg text-foreground flex items-center gap-1">
              {isEdit
                ? t('edit-group', 'Edit Group')
                : t('add-group', 'Add Group')}
            </Sheet.Title>
            <Sheet.Description className="sr-only">
              {t(
                'group-description',
                'Add a new group for the content type {{type}}',
                {
                  type: contentType,
                },
              )}
            </Sheet.Description>
            <Sheet.Close />
          </Sheet.Header>
        )}
        <Content
          className={
            layout === 'record'
              ? 'min-h-0 flex-1 overflow-y-auto flex flex-col px-3 py-3 gap-3'
              : 'grow size-full h-auto flex flex-col px-5 py-4 gap-5'
          }
        >
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
                    className="input"
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />

          {!locked && (
            <>
              <Form.Field
                name="code"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('code', 'Code')}</Form.Label>
                    <Form.Control>
                      <Input
                        {...field}
                        type="text"
                        placeholder={t('enter-group-code', 'Enter group code')}
                        className="input"
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                name="isMultiple"
                render={({ field }) => (
                  <Form.Item>
                    <div className="flex items-center gap-2">
                      <Form.Control>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </Form.Control>
                      <Form.Label variant="peer">
                        {t('group-is-multiple', 'Allow multiple entries')}
                      </Form.Label>
                    </div>
                    <Form.Description>
                      {t(
                        'group-is-multiple-description',
                        'Records can fill this group more than once.',
                      )}
                    </Form.Description>
                  </Form.Item>
                )}
              />
            </>
          )}
        </Content>
        <Footer
          className={
            layout === 'record'
              ? 'flex shrink-0 justify-end gap-1 border-t p-2'
              : undefined
          }
        >
          <Button type="button" variant={'ghost'} onClick={onCancel}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? <Spinner /> : isEdit ? <IconPencil /> : <IconPlus />}
            {isEdit ? t('update', 'Update') : t('create', 'Create')}
          </Button>
        </Footer>
      </form>
    </Form>
  );
};

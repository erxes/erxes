import {
  Button,
  Form,
  IconPicker,
  Input,
  Select,
  Spinner,
  Textarea,
} from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { IPropertyForm } from '../types/Properties';
import { zodResolver } from '@hookform/resolvers/zod';
import { propertySchema } from '../propertySchema';

import { PropertyFormValidation } from './PropertyFormValidations';
import { PropertyFormSelectFields } from './PropertyFormSelectFields';
import { PropertySelectRelationType } from './PropertySelectRelationType';
import { FIELD_TYPES, FIELD_TYPES_OBJECT } from '../constants/fieldTypes';
import { IconPencil, IconPlus } from '@tabler/icons-react';
import { Can } from 'ui-modules';

export const PropertyForm = ({
  onSubmit,
  loading,
  defaultValues,
  isEdit,
  disableType,
}: {
  onSubmit: (data: IPropertyForm) => void;
  loading: boolean;
  defaultValues: IPropertyForm;
  isEdit?: boolean;
  disableType?: boolean;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const form = useForm<IPropertyForm>({
    resolver: zodResolver(propertySchema),
    defaultValues,
  });

  const handleSubmit = (data: IPropertyForm) => {
    let sendData = data;

    if (FIELD_TYPES_OBJECT.relation.value === sendData.type) {
      sendData = {
        ...sendData,
        type: 'relation:' + sendData.relationType,
      };
    }
    onSubmit(sendData);
  };

  return (
    <Form {...form}>
      <form
        className="w-full flex flex-col gap-5"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <div className="flex gap-5">
          <Form.Field
            name="icon"
            render={({ field }) => (
              <Form.Item className="flex-none">
                <Form.Label>{t('icon', 'Icon')}</Form.Label>
                <Form.Control>
                  <IconPicker
                    onValueChange={field.onChange}
                    value={field.value}
                    variant="outline"
                    size="icon"
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            name="name"
            render={({ field }) => (
              <Form.Item className="flex-auto">
                <Form.Label>{t('name', 'Name')}</Form.Label>
                <Form.Control>
                  <Input {...field} />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
        </div>
        <Form.Field
          name="code"
          render={({ field }) => (
            <Form.Item className="flex-auto">
              <Form.Label>{t('code', 'Code')}</Form.Label>
              <Form.Control>
                <Input {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          name="description"
          render={({ field }) => (
            <Form.Item className="flex-auto">
              <Form.Label>{t('description', 'Description')}</Form.Label>
              <Form.Control>
                <Textarea {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          name="type"
          render={({ field }) => (
            <Form.Item className="flex-auto">
              <Form.Label>{t('type', 'Type')}</Form.Label>

              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  form.setValue('options', []);
                }}
                disabled={isEdit || disableType}
              >
                <Form.Control>
                  <Select.Trigger>
                    <Select.Value placeholder={t('select-type', 'Select type')} />
                  </Select.Trigger>
                </Form.Control>
                <Select.Content>
                  {FIELD_TYPES.map((type) => (
                    <Select.Item key={type.value} value={type.value}>
                      <div className="flex items-center gap-2 [&_svg]:size-4">
                        {type.icon}
                        {t(`field-type.${type.value}`, type.label)}
                      </div>
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
              <Form.Message />
            </Form.Item>
          )}
        />
        <PropertyFormValidation form={form} />
        <PropertyFormSelectFields form={form} isEdit={isEdit} />
        <PropertySelectRelationType form={form} />
        <Can action="fieldsManage">
          <Button type="submit" disabled={loading}>
            {loading ? (
              <Spinner containerClassName="flex-none" />
            ) : isEdit ? (
              <IconPencil />
            ) : (
              <IconPlus />
            )}
            {isEdit
              ? t('update-property', 'Update Property')
              : t('add-property', 'Add Property')}
          </Button>
        </Can>
      </form>
    </Form>
  );
};

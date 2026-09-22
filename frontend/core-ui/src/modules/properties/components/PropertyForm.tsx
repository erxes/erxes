import {
  Button,
  Form,
  IconPicker,
  Input,
  ScrollArea,
  Select,
  Sheet,
  Spinner,
  Switch,
  Textarea,
} from 'erxes-ui';
import { FIELD_TYPES, FIELD_TYPES_OBJECT } from '../constants/fieldTypes';
import { IconPencil, IconPlus } from '@tabler/icons-react';

import { Can } from 'ui-modules';
import { IPropertyForm } from '../types/Properties';
import { PropertyFormGroupField } from './PropertyFormGroupField';
import { PropertyFormLogicFields } from './PropertyFormLogicFields';
import { PropertyFormObjectListFields } from './PropertyFormObjectListFields';
import { PropertyFormSelectFields } from './PropertyFormSelectFields';
import { PropertyFormValidation } from './PropertyFormValidations';
import { PropertySelectRelationType } from './PropertySelectRelationType';
import { propertySchema } from '../propertySchema';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';

export const PropertyForm = ({
  onSubmit,
  loading,
  defaultValues,
  isEdit,
  disableType,
  onCancel,
  contentType,
  fieldId,
}: {
  onSubmit: (data: IPropertyForm) => void;
  loading: boolean;
  defaultValues: IPropertyForm;
  isEdit?: boolean;
  disableType?: boolean;
  onCancel: () => void;
  contentType: string;
  fieldId?: string;
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
    if (FIELD_TYPES_OBJECT.objectList.value === sendData.type) {
      sendData = {
        ...sendData,
        configs: { objectListConfigs: sendData.objectListConfigs },
      };
    }
    sendData = {
      ...sendData,
      logics: (sendData.logics || []).filter((rule) => rule.field),
    };
    onSubmit(sendData);
  };

  return (
    <Form {...form}>
      <form
        className="w-full h-full flex flex-col gap-0"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <Sheet.Header>
          <Sheet.Title className="text-lg text-foreground flex items-center gap-1">
            {isEdit
              ? t('edit-property', 'Edit Property')
              : t('add-property', 'Add Property')}
          </Sheet.Title>
          <Sheet.Description className="sr-only">
            {isEdit
              ? t('edit-property-description', 'Edit this property')
              : t('add-property-description', 'Add a new property')}
          </Sheet.Description>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="overflow-y-auto">
          <ScrollArea className="flex-auto">
            <div className="flex flex-col px-5 py-4 gap-5">
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
              <PropertyFormGroupField form={form} contentType={contentType} />
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
                        form.setValue('objectListConfigs', []);
                      }}
                      disabled={isEdit || disableType}
                    >
                      <Form.Control>
                        <Select.Trigger>
                          <Select.Value
                            placeholder={t('select-type', 'Select type')}
                          />
                        </Select.Trigger>
                      </Form.Control>
                      <Select.Content>
                        {FIELD_TYPES.map((type) => (
                          <Select.Item key={type.value} value={type.value}>
                            <div className="flex items-center gap-2 [&_svg]:size-4">
                              <type.icon />
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
              <Form.Field
                name="isVisibleInCard"
                render={({ field }) => (
                  <Form.Item className="flex-auto flex flex-row items-center justify-between space-y-0">
                    <Form.Label>{t('show-in-card', 'Show in card')}</Form.Label>
                    <Form.Control>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <PropertyFormValidation form={form} />
              <PropertyFormSelectFields form={form} isEdit={isEdit} />
              <PropertyFormObjectListFields form={form} isEdit={isEdit} />
              <PropertySelectRelationType form={form} />
              <PropertyFormLogicFields
                form={form}
                contentType={contentType}
                excludeFieldId={fieldId}
              />
            </div>
          </ScrollArea>
        </Sheet.Content>
        <Sheet.Footer>
          <Button variant="ghost" onClick={onCancel}>
            {t('cancel', 'Cancel')}
          </Button>
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
        </Sheet.Footer>
      </form>
    </Form>
  );
};

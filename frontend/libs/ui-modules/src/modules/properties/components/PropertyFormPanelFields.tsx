import {
  IconAlignLeft,
  IconCategory,
  IconHash,
  IconIcons,
  IconId,
  IconLetterCase,
} from '@tabler/icons-react';
import {
  Button,
  Form,
  IconPicker,
  Input,
  Select,
  Spinner,
  Switch,
  Textarea,
} from 'erxes-ui';
import { type ReactNode } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Can } from '../../permissions/components/PermissionGate';
import { useTranslation } from 'react-i18next';
import {
  PANEL_INPUT_CLASS_NAME,
  PanelFormRow,
} from '../../widget/record-side-panel/PanelForm';
import { FIELD_TYPES } from '../constants/fieldTypes';
import { IPropertyForm } from '../types/propertyFormTypes';
import { PropertyFormGroupField } from './PropertyFormGroupField';

export const PropertyFormPanel = ({
  form,
  onSubmit,
  onCancel,
  loading,
  isEdit,
  locked,
  children,
}: {
  form: UseFormReturn<IPropertyForm>;
  onSubmit: (data: IPropertyForm) => void;
  onCancel: () => void;
  loading: boolean;
  isEdit?: boolean;
  locked?: boolean;
  children: ReactNode;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });

  return (
    <Form {...form}>
      <form
        className="flex flex-1 min-h-0 flex-col"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="flex flex-col gap-4 p-3">
            {locked && (
              <p className="text-xs text-muted-foreground">
                {t(
                  'featured-field-edit-hint',
                  'A plugin feature owns this field and fills its values: its type and options cannot change, but its name, icon and visibility can.',
                )}
              </p>
            )}
            {children}
          </div>
        </div>
        <div className="flex shrink-0 justify-end gap-1 border-t bg-background p-2">
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            {t('cancel', 'Cancel')}
          </Button>
          <Can action="fieldsManage">
            <Button type="submit" size="sm" disabled={loading}>
              {loading && <Spinner size="sm" />}
              {isEdit
                ? t('update-property', 'Update Property')
                : t('add-property', 'Add Property')}
            </Button>
          </Can>
        </div>
      </form>
    </Form>
  );
};

export const PropertyTypeSelectContent = ({
  allowedTypes,
}: {
  allowedTypes: string[];
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });

  return (
    <Select.Content>
      {FIELD_TYPES.filter(({ value }) => allowedTypes.includes(value)).map(
        (type) => (
          <Select.Item key={type.value} value={type.value}>
            <div className="flex items-center gap-2 [&_svg]:size-4">
              <type.icon />
              {t(`field-type.${type.value}`, type.label)}
            </div>
          </Select.Item>
        ),
      )}
    </Select.Content>
  );
};

export const PropertyFormPanelFields = ({
  form,
  contentType,
  locked,
  typeDisabled,
  allowedTypes,
  onTypeChange,
  typeHint,
}: {
  form: UseFormReturn<IPropertyForm>;
  contentType: string;
  locked?: boolean;
  typeDisabled: boolean;
  allowedTypes: string[];
  onTypeChange: (value: string) => void;
  typeHint?: React.ReactNode;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const { errors } = form.formState;

  return (
    <div className="flex flex-col gap-1">
      <PanelFormRow label={t('icon', 'Icon')} icon={IconIcons}>
        <Form.Field
          name="icon"
          render={({ field }) => (
            <IconPicker
              onValueChange={field.onChange}
              value={field.value}
              variant="ghost"
              size="icon"
            />
          )}
        />
      </PanelFormRow>
      <PanelFormRow
        label={t('name', 'Name')}
        icon={IconLetterCase}
        required
        error={errors.name?.message}
      >
        <Input
          {...form.register('name')}
          placeholder={t('name', 'Name')}
          className={PANEL_INPUT_CLASS_NAME}
          aria-invalid={!!errors.name}
        />
      </PanelFormRow>
      {!locked && (
        <>
          <PanelFormRow
            label={t('code', 'Code')}
            icon={IconHash}
            error={errors.code?.message}
          >
            <Input
              {...form.register('code')}
              placeholder={t('code', 'Code')}
              className={PANEL_INPUT_CLASS_NAME}
            />
          </PanelFormRow>
          <PanelFormRow
            label={t('description', 'Description')}
            icon={IconAlignLeft}
          >
            <Textarea
              {...form.register('description')}
              placeholder={t('description', 'Description')}
              rows={2}
              className="min-h-14 resize-none text-xs shadow-none"
            />
          </PanelFormRow>
          <PropertyFormGroupField
            form={form}
            contentType={contentType}
            variant="panel"
          />
        </>
      )}
      <PanelFormRow
        label={t('type', 'Type')}
        icon={IconCategory}
        required
        error={errors.type?.message}
      >
        <Form.Field
          name="type"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value);
                onTypeChange(value);
              }}
              disabled={typeDisabled}
            >
              <Select.Trigger className={PANEL_INPUT_CLASS_NAME}>
                <Select.Value placeholder={t('select-type', 'Select type')} />
              </Select.Trigger>
              <PropertyTypeSelectContent allowedTypes={allowedTypes} />
            </Select>
          )}
        />
      </PanelFormRow>
      {typeHint}
      <PanelFormRow label={t('show-in-card', 'Show in card')} icon={IconId}>
        <Form.Field
          name="isVisibleInCard"
          render={({ field }) => (
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          )}
        />
      </PanelFormRow>
    </div>
  );
};

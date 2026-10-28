import { Form, IconPicker, Input, MultipleSelector, Select } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { STRUCTURE_LEGACY_KINDS } from '../../constants/structureCapabilities';
import {
  IStructureEntityTypeDetail,
  IStructureEntityTypeForm,
} from '../../types/structureEntity';

export const StructureEntityTypeGeneralTab = ({
  type,
  types,
}: {
  type: IStructureEntityTypeDetail;
  types: IStructureEntityTypeDetail[];
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { control } = useFormContext<IStructureEntityTypeForm>();
  const isSystem = Boolean(type.isSystem);
  const parentOptions = types.map(({ _id, name }) => ({
    value: _id,
    label: _id === type._id ? `${name} (${t('this-type')})` : name,
  }));
  const labelOf = (value: string) =>
    parentOptions.find((option) => option.value === value)?.label ?? value;

  return (
    <div className="flex flex-col gap-4 py-4">
      <Form.Field
        control={control}
        name="name"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('name')}</Form.Label>
            <div className="flex items-center gap-2">
              <Form.Field
                control={control}
                name="icon"
                render={({ field: iconField }) => (
                  <IconPicker
                    value={iconField.value}
                    onValueChange={(value) => iconField.onChange(value ?? '')}
                    aria-label={t('icon')}
                  />
                )}
              />
              <Form.Control>
                <Input {...field} />
              </Form.Control>
            </div>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name="parentTypeIds"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('allowed-parents')}</Form.Label>
            <Form.Control>
              <MultipleSelector
                options={parentOptions}
                value={field.value.map((value) => ({
                  value,
                  label: labelOf(value),
                }))}
                onChange={(selected) =>
                  field.onChange(selected.map(({ value }) => value))
                }
                placeholder={t('any-parent')}
                disabled={isSystem}
                hidePlaceholderWhenSelected
              />
            </Form.Control>
            <Form.Description>
              {t('allowed-parents-description')}
            </Form.Description>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name="legacyKind"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('client-portal-kind')}</Form.Label>
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={isSystem}
            >
              <Form.Control>
                <Select.Trigger className="w-64">
                  <Select.Value />
                </Select.Trigger>
              </Form.Control>
              <Select.Content>
                {STRUCTURE_LEGACY_KINDS.map((kind) => (
                  <Select.Item key={kind} value={kind}>
                    {t(`legacy-kind-${kind}`)}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
            <Form.Description>
              {t('client-portal-kind-description')}
            </Form.Description>
            <Form.Message />
          </Form.Item>
        )}
      />
    </div>
  );
};

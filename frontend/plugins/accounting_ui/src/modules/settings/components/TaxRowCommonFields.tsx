import { useTranslation } from 'react-i18next';
import { Control, FieldPath, FieldValues } from 'react-hook-form';
import { Form, Input, Select } from 'erxes-ui';

export const TaxRowCommonFields = <T extends FieldValues>({
  control,
  kinds,
  kindLabels,
  statuses,
  statusLabels,
  statusColSpan = false,
}: {
  control: Control<T>;
  kinds: string[];
  kindLabels: Record<string, string>;
  statuses: string[];
  statusLabels: Record<string, string>;
  statusColSpan?: boolean;
}) => {
  const { t } = useTranslation('accounting');

  return (
    <>
      <Form.Field
        control={control}
        name={'number' as FieldPath<T>}
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('number')}</Form.Label>
            <Form.Control>
              <Input {...field} />
            </Form.Control>
          </Form.Item>
        )}
      />

      <Form.Field
        control={control}
        name={'name' as FieldPath<T>}
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('name')}</Form.Label>
            <Form.Control>
              <Input {...field} />
            </Form.Control>
          </Form.Item>
        )}
      />

      <Form.Field
        control={control}
        name={'kind' as FieldPath<T>}
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('type')}</Form.Label>
            <Select value={field.value} onValueChange={field.onChange}>
              <Form.Control>
                <Select.Trigger>
                  <Select.Value placeholder={t('select-type')} />
                </Select.Trigger>
              </Form.Control>
              <Select.Content>
                {kinds.map((kind) => (
                  <Select.Item key={kind} value={kind} className="capitalize">
                    {kindLabels[kind]}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </Form.Item>
        )}
      />

      <Form.Field
        control={control}
        name={'percent' as FieldPath<T>}
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('percentage')}</Form.Label>
            <Form.Control>
              <Input
                type="number"
                value={field.value}
                onChange={(e) => field.onChange(Number(e.target.value))}
                min={0}
                max={100}
              />
            </Form.Control>
          </Form.Item>
        )}
      />

      <Form.Field
        control={control}
        name={'status' as FieldPath<T>}
        render={({ field }) => (
          <Form.Item className={statusColSpan ? 'col-span-2' : undefined}>
            <Form.Label>{t('status')}</Form.Label>
            <Select value={field.value} onValueChange={field.onChange}>
              <Form.Control>
                <Select.Trigger>
                  <Select.Value placeholder={t('select-a-status')} />
                </Select.Trigger>
              </Form.Control>
              <Select.Content>
                {statuses.map((status) => (
                  <Select.Item
                    key={status}
                    value={status}
                    className="capitalize"
                  >
                    {t(statusLabels[status])}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </Form.Item>
        )}
      />
    </>
  );
};

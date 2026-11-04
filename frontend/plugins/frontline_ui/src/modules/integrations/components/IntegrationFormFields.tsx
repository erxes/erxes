import { Form, Input } from 'erxes-ui';
import {
  PANEL_INPUT_CLASS_NAME,
  PanelFormRow,
  SelectBrand,
  SelectBrands,
} from 'ui-modules';
import { useTranslation } from 'react-i18next';
import type { UseFormRegisterReturn } from 'react-hook-form';

/** Shares panel name markup while preserving controlled and registered inputs. */
export const IntegrationNameField = ({
  label,
  description,
  showMessage = true,
  registration,
  error,
}: {
  label?: string;
  description?: string;
  showMessage?: boolean;
  registration?: UseFormRegisterReturn<'name'>;
  error?: string;
}) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });

  if (registration) {
    return (
      <PanelFormRow label={label ?? t('name')} error={error}>
        <Input {...registration} className={PANEL_INPUT_CLASS_NAME} />
      </PanelFormRow>
    );
  }

  return (
    <Form.Field
      name="name"
      render={({ field }) => (
        <Form.Item>
          <PanelFormRow label={label ?? t('name')}>
            <Form.Control>
              <Input {...field} className={PANEL_INPUT_CLASS_NAME} />
            </Form.Control>
            {description && <Form.Description>{description}</Form.Description>}
            {showMessage && <Form.Message />}
          </PanelFormRow>
        </Form.Item>
      )}
    />
  );
};

/** Shares brand markup while retaining each provider's selector and row layout. */
export const IntegrationBrandField = ({
  required,
  variant = 'single',
  outerRow = false,
  description,
}: {
  required?: boolean;
  variant?: 'single' | 'form-item';
  outerRow?: boolean;
  description?: string;
}) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });
  const brandField = (
    <Form.Field
      name="brandId"
      render={({ field }) => {
        const selector = (
          <>
            {variant === 'single' ? (
              <Form.Control>
                <SelectBrand
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder={t('select-a-brand')}
                  className="w-full"
                />
              </Form.Control>
            ) : (
              <SelectBrands.FormItem
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
            {description && <Form.Description>{description}</Form.Description>}
            <Form.Message />
          </>
        );
        return (
          <Form.Item>
            {outerRow ? (
              selector
            ) : (
              <PanelFormRow label={t('brand')} required={required}>
                {selector}
              </PanelFormRow>
            )}
          </Form.Item>
        );
      }}
    />
  );
  return outerRow ? (
    <PanelFormRow label={t('brand')} required={required}>
      {brandField}
    </PanelFormRow>
  ) : (
    brandField
  );
};

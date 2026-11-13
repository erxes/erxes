import type { CustomValue } from '@erxes/core-contract';
import { Form, MultipleSelector } from 'erxes-ui';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { messageOf } from '~/lib/api';
import { CustomFieldSections } from '~/modules/properties/CustomFieldSections';
import { PRODUCT_SETTINGS } from '../paths';
import { pluginTitle, useInstalledPlugins } from '../useCatalogContext';
import type { ProductFormValues } from './productFormValues';

/** "Used by": the installed plugins that list the product. */
export const ProductPluginsField = ({ disabled }: { disabled: boolean }) => {
  const { t } = useTranslation('product');
  const { control } = useFormContext<ProductFormValues>();
  const { plugins, error } = useInstalledPlugins();
  const options = plugins.map((plugin) => ({ value: plugin.name, label: plugin.title }));

  return (
    <Form.Field
      control={control}
      name="plugins"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('fields.plugins', 'Used by')}</Form.Label>
          <MultipleSelector
            value={field.value.map((name) => ({ value: name, label: pluginTitle(plugins, name) }))}
            onChange={(chosen) => field.onChange(chosen.map((option) => option.value))}
            defaultOptions={options}
            options={options}
            disabled={disabled}
            placeholder={t('form.plugins-placeholder', 'Choose the apps that sell or use it')}
            emptyIndicator={
              <p className="p-2 text-center text-sm text-muted-foreground">
                {plugins.length === 0
                  ? t('form.no-plugins', 'No apps installed')
                  : t('form.all-plugins-chosen', 'Every installed app is chosen')}
              </p>
            }
            hidePlaceholderWhenSelected
          />
          <Form.Description>
            {t('form.plugins-hint', 'Each app lists the products it uses.')}
          </Form.Description>
          {error && <p className="text-sm text-destructive">{messageOf(error)}</p>}
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};

/** Saved values with the unsaved changes on top (a cleared value is gone). */
const withChanges = (
  saved: Record<string, CustomValue>,
  changes: Record<string, CustomValue | null>,
) =>
  Object.fromEntries(
    Object.entries({ ...saved, ...changes }).filter(
      (entry): entry is [string, CustomValue] => entry[1] !== null,
    ),
  );

/** The organisation's product properties; changes are saved with the product. */
export const ProductPropertiesField = ({
  scope,
  saved,
}: {
  scope: string;
  saved: Record<string, CustomValue>;
}) => {
  const { t } = useTranslation('product');
  const { control, setValue } = useFormContext<ProductFormValues>();
  const changes = useWatch({ control, name: 'customFields' });

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">{t('fields.properties', 'Properties')}</span>
      <CustomFieldSections
        contentType="product"
        scope={scope}
        values={withChanges(saved, changes)}
        onSave={(patch) =>
          setValue('customFields', { ...changes, ...patch }, { shouldDirty: true })
        }
        empty={
          <p className="text-sm text-muted-foreground">
            {t('form.no-properties', 'No product properties yet.')}{' '}
            <Link to={PRODUCT_SETTINGS.properties} className="text-primary hover:underline">
              {t('form.add-properties', 'Add them in settings')}
            </Link>
          </p>
        }
      />
    </div>
  );
};

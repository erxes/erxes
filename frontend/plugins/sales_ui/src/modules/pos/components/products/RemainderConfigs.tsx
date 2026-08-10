import { Checkbox, Form, Label } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useWatch, type Control } from 'react-hook-form';
import { type ProductsFormData } from '@/pos/components/products/Products';
import { SelectCategory } from 'ui-modules/modules';

interface RemainderConfigsProps {
  control: Control<ProductsFormData>;
}

export const RemainderConfigs: React.FC<RemainderConfigsProps> = ({
  control,
}) => {
  const { t } = useTranslation('sales');
  const isCheckRemainder = useWatch({
    control,
    name: 'isCheckRemainder',
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Form.Field
          control={control}
          name="isCheckRemainder"
          render={({ field }) => (
            <Form.Item>
              <div className="flex gap-2 items-center">
                <Form.Control>
                  <Checkbox
                    id="isCheckRemainder"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </Form.Control>
                <Label htmlFor="isCheckRemainder" className="cursor-pointer">
                  {t('check-remainder')}
                </Label>
              </div>
            </Form.Item>
          )}
        />

        {isCheckRemainder && (<Form.Field
          control={control}
          name="saveRemainder"
          render={({ field }) => (
            <Form.Item>
              <div className="flex gap-2 items-center">
                <Form.Control>
                  <Checkbox
                    id="saveRemainder"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </Form.Control>
                <Label htmlFor="saveRemainder" className="cursor-pointer">
                  {t('save-remainder')}
                </Label>
              </div>
            </Form.Item>
          )}
        />)}

        <Form.Field
          control={control}
          name="banFractions"
          render={({ field }) => (
            <Form.Item>
              <div className="flex gap-2 items-center">
                <Form.Control>
                  <Checkbox
                    id="banFractions"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </Form.Control>
                <Label htmlFor="banFractions">{t('ban-fractions')}</Label>
              </div>
            </Form.Item>
          )}
        />
      </div>

      <Form.Field
        control={control}
        name="checkExcludeCategoryIds"
        render={({ field }) => (
          <Form.Item>
            <Label>{t('exclude-categories')}</Label>

            <Form.Control>
              <SelectCategory
                mode="multiple"
                value={field.value}
                onValueChange={field.onChange}
                placeholder={t('select-categories-to-exclude')}
              />
            </Form.Control>
          </Form.Item>
        )}
      />
    </div>
  );
};

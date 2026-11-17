import { Form } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { type Control } from 'react-hook-form';
import { type ProductsFormData } from '@/pos/components/products/Products';
import {
  PosSwitchList,
  PosSwitchRow,
} from '@/pos/components/pos-edit/PosSwitchRow';
import { usePosSettingsLabels } from '@/pos/hooks/usePosSettingsLabels';
import { SelectCategory } from 'ui-modules/modules';

interface RemainderConfigsProps {
  control: Control<ProductsFormData>;
}

export const RemainderConfigs: React.FC<RemainderConfigsProps> = ({
  control,
}) => {
  const { t } = useTranslation('sales');
  const labels = usePosSettingsLabels();

  return (
    <PosSwitchList>
      <PosSwitchRow
        control={control}
        name="isShowRemainder"
        label={labels.showRemainder}
        description={labels.showRemainderDescription}
      />
      <PosSwitchRow
        control={control}
        name="isCheckRemainder"
        label={t('check-remainder')}
        description={labels.checkRemainderDescription}
      >
        <PosSwitchList>
          <PosSwitchRow
            control={control}
            name="saveRemainder"
            label={t('save-remainder')}
            description={labels.saveRemainderDescription}
          />
        </PosSwitchList>
        <Form.Field
          control={control}
          name="checkExcludeCategoryIds"
          render={({ field }) => (
            <Form.Item>
              <Form.Label variant="peer" className="text-sm font-medium">
                {t('exclude-categories')}
              </Form.Label>
              <Form.Control>
                <SelectCategory
                  mode="multiple"
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder={t('select-categories-to-exclude')}
                />
              </Form.Control>
              <Form.Description>
                {labels.checkExcludeDescription}
              </Form.Description>
            </Form.Item>
          )}
        />
      </PosSwitchRow>
      <PosSwitchRow
        control={control}
        name="banFractions"
        label={labels.banFractions}
        description={labels.banFractionsDescription}
      />
    </PosSwitchList>
  );
};

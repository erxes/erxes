import { useTranslation } from 'react-i18next';
import { useFieldArray } from 'react-hook-form';
import { Button, Form, Input, Select } from 'erxes-ui';
import { SelectFixedAsset } from '@/settings/fixed-assets/components/SelectFixedAsset';
import { useFixedAssetAccountConfigs } from '@/settings/fixed-assets/account-config/hooks/useFixedAssetAccountConfigs';
import { FIXED_ASSET_DEPRECIATION_METHODS } from '@/settings/fixed-assets/constants/depreciationMethods';
import { JournalEnum } from '@/settings/account/types/Account';
import { ITransactionGroupForm } from '@/transactions/transaction-form/types/JournalForms';
import {
  AccountField,
  BranchField,
  DepartmentField,
  DescriptionField,
  SideField,
} from '@/transactions/transaction-form/components/GeneralFormFields';
import { getTempId } from '@/transactions/transaction-form/components/utils';

const numericRules = [
  {
    key: 'annualDepreciationRate',
    label: 'annual-depreciation-rate',
    fallback: 'Жилийн элэгдлийн хувь',
    min: 0,
    max: 100,
  },
  {
    key: 'salvageValue',
    label: 'salvage-value',
    fallback: 'Нэгжийн үлдэх өртөг',
    min: 0,
    max: undefined,
  },
] as const;

export const FxaJustifyForm = ({
  form,
  index,
}: {
  form: ITransactionGroupForm;
  index: number;
}) => {
  const { t } = useTranslation('accounting');
  const { configs, loading, error } = useFixedAssetAccountConfigs();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `trDocs.${index}.details`,
  });
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        <SideField
          form={form}
          index={index}
          labelTxt="Хуримтлагдсан элэгдлийн өөрчлөлт"
          sides={[
            { value: 'ct', label: 'Нэмэгдүүлэх' },
            { value: 'dt', label: 'Бууруулах' },
          ]}
        />
        <BranchField form={form} index={index} />
        <DepartmentField form={form} index={index} />
        <DescriptionField form={form} index={index} />
      </div>
      <p className="text-sm text-muted-foreground">
        {t('fxa-correction-help', {
          defaultValue:
            'Өмнөх тайлант үеийн алдааг засахдаа алдаа гарсан үеийн огноог сонгоно. Тухайн өдрөөс хойших элэгдлийн тооцоог цэвэрлэж, дахин бодно. Хоосон талбар өмнөх утгаа хадгална. Хуримтлагдсан элэгдлийн өөрчлөлтийн дүнг нийт мөнгөн зөрүүгээр оруулж, эсрэг бичилтийг гүйлгээ нэмэх үйлдлээр бүртгэнэ. Зөвхөн суурь мэдээлэл засах бол дүн 0 байна.',
        })}
      </p>
      {loading && (
        <p className="text-sm text-muted-foreground">{t('loading')}</p>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error.message}
        </p>
      )}
      {fields.map((row, detailIndex) => (
        <div key={row.id} className="space-y-4 rounded border p-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <Form.Field
              control={form.control}
              name={`trDocs.${index}.details.${detailIndex}.fixedAssetId`}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('fixed-asset')}</Form.Label>
                  <SelectFixedAsset.FormItem
                    value={field.value || ''}
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue(
                        `trDocs.${index}.details.${detailIndex}.followInfos`,
                        {},
                      );
                      form.setValue(
                        `trDocs.${index}.details.${detailIndex}.amount`,
                        0,
                      );
                    }}
                    onCallback={(asset) => {
                      const accountId = configs.find(
                        (config) => config.accountId === asset.accountId,
                      )?.value.depreciationAccountId;
                      form.setValue(
                        `trDocs.${index}.details.${detailIndex}.accountId`,
                        accountId || '',
                      );
                    }}
                  />
                  <Form.Message />
                </Form.Item>
              )}
            />
            <AccountField
              form={form}
              index={index}
              detIndex={detailIndex}
              labelTxt="accumulated-depreciation-account"
              filter={{ journals: [JournalEnum.FXA_FOLLOW] }}
            />
            <Form.Field
              control={form.control}
              name={`trDocs.${index}.details.${detailIndex}.amount`}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>
                    {t('fxa-correction-amount', {
                      defaultValue: 'Хуримтлагдсан элэгдлийн зөрүү',
                    })}
                  </Form.Label>
                  <Form.Control>
                    <Input
                      type="number"
                      min={0}
                      step="any"
                      value={field.value ?? 0}
                      onChange={(event) =>
                        field.onChange(Number(event.target.value))
                      }
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name={`trDocs.${index}.details.${detailIndex}.followInfos.depreciationMethod`}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('depreciation-method')}</Form.Label>
                  <Select
                    value={field.value || 'unchanged'}
                    onValueChange={(value) =>
                      field.onChange(value === 'unchanged' ? undefined : value)
                    }
                  >
                    <Form.Control>
                      <Select.Trigger>
                        <Select.Value />
                      </Select.Trigger>
                    </Form.Control>
                    <Select.Content>
                      <Select.Item value="unchanged">
                        {t('fxa-keep-current', { defaultValue: 'Өмнөх утга' })}
                      </Select.Item>
                      {FIXED_ASSET_DEPRECIATION_METHODS.filter(
                        (method) => method.value !== 'manual',
                      ).map((method) => (
                        <Select.Item key={method.value} value={method.value}>
                          {t(method.label)}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                  <Form.Message />
                </Form.Item>
              )}
            />
            {numericRules.map((rule) => (
              <Form.Field
                key={rule.key}
                control={form.control}
                name={`trDocs.${index}.details.${detailIndex}.followInfos.${rule.key}`}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>
                      {t(rule.label, { defaultValue: rule.fallback })}
                    </Form.Label>
                    <Form.Control>
                      <Input
                        type="number"
                        min={rule.min}
                        max={rule.max}
                        step="any"
                        placeholder={t('fxa-keep-current', {
                          defaultValue: 'Өмнөх утга',
                        })}
                        value={field.value ?? ''}
                        onChange={(event) =>
                          field.onChange(
                            event.target.value === ''
                              ? undefined
                              : Number(event.target.value),
                          )
                        }
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            ))}
            <Form.Field
              control={form.control}
              name={`trDocs.${index}.details.${detailIndex}.followInfos.depreciationStartDate`}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('depreciation-start-date')}</Form.Label>
                  <Form.Control>
                    <Input
                      type="date"
                      value={field.value?.slice(0, 10) || ''}
                      onChange={(event) =>
                        field.onChange(event.target.value || undefined)
                      }
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            onClick={() => remove(detailIndex)}
          >
            {t('remove')}
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="secondary"
        onClick={() =>
          append({
            _id: getTempId(),
            fixedAssetId: '',
            accountId: '',
            count: 0,
            amount: 0,
            unitPrice: 0,
            followInfos: {},
          })
        }
      >
        {t('new-row')}
      </Button>
    </div>
  );
};

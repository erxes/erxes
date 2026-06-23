import { SelectAccount } from '@/settings/account/components/SelectAccount';
import { JournalEnum } from '@/settings/account/types/Account';
import { Form } from 'erxes-ui';
import { ITransactionGroupForm } from '../../../types/JournalForms';
import { useFixedAssetAccountConfigs } from '@/settings/fixed-assets/account-config/hooks/useFixedAssetAccountConfigs';

export const FxaSaleAccountFields = ({
  form,
  index,
}: {
  form: ITransactionGroupForm;
  index: number;
}) => {
  const { configs } = useFixedAssetAccountConfigs();

  const applyAccountConfig = (accountId: string) => {
    const value = configs?.find((config) => config.accountId === accountId)?.value;

    if (!value) {
      return;
    }

    form.setValue(
      `trDocs.${index}.followInfos.accumulatedDepreciationAccountId`,
      value.depreciationAccountId,
    );
    form.setValue(
      `trDocs.${index}.followInfos.deferredTaxAssetAccountId`,
      value.taxAssetAccountId,
    );
    form.setValue(
      `trDocs.${index}.followInfos.deferredTaxLiabilityAccountId`,
      value.taxLiabilityAccountId,
    );
    form.setValue(
      `trDocs.${index}.followInfos.incomeTaxExpenseAccountId`,
      value.TaxExpenseAccountId,
    );
  };

  return (
  <>
    <Form.Field
      control={form.control}
      name={`trDocs.${index}.followInfos.fixedAssetAccountId`}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Хөрөнгийн данс</Form.Label>
          <Form.Control>
            <SelectAccount
              value={field.value || ''}
              onValueChange={(value) => {
                field.onChange(value);
                applyAccountConfig(value as string);
              }}
              defaultFilter={{
                journals: [JournalEnum.FIXED_ASSET],
                permissionMode: 'write',
              }}
              onCallback={(account) =>
                form.setValue(
                  `trDocs.${index}.followExtras.fixedAssetAccount`,
                  account,
                )
              }
            />
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
    <Form.Field
      control={form.control}
      name={`trDocs.${index}.followInfos.accumulatedDepreciationAccountId`}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Хур. элэгдлийн данс</Form.Label>
          <Form.Control>
            <SelectAccount
              value={field.value || ''}
              onValueChange={field.onChange}
              defaultFilter={{
                journals: [JournalEnum.FIXED_ASSET],
                permissionMode: 'write',
              }}
            />
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
    <Form.Field
      control={form.control}
      name={`trDocs.${index}.followInfos.gainAccountId`}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Ашгийн данс</Form.Label>
          <Form.Control>
            <SelectAccount
              value={field.value || ''}
              onValueChange={field.onChange}
              defaultFilter={{ permissionMode: 'write' }}
            />
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
    <Form.Field
      control={form.control}
      name={`trDocs.${index}.followInfos.lossAccountId`}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Алдагдлын данс</Form.Label>
          <Form.Control>
            <SelectAccount
              value={field.value || ''}
              onValueChange={field.onChange}
              defaultFilter={{ permissionMode: 'write' }}
            />
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
  </>
  );
};

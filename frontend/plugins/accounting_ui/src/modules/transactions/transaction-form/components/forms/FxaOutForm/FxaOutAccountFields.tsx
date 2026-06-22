import { SelectAccount } from '@/settings/account/components/SelectAccount';
import { JournalEnum } from '@/settings/account/types/Account';
import { Form } from 'erxes-ui';
import { ITransactionGroupForm } from '../../../types/JournalForms';

export const FxaOutAccountFields = ({
  form,
  index,
}: {
  form: ITransactionGroupForm;
  index: number;
}) => (
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
              onValueChange={field.onChange}
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

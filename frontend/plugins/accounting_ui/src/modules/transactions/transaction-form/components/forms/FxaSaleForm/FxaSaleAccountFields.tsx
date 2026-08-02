import { SelectAccount } from '@/settings/account/components/SelectAccount';
import { IAccount, JournalEnum } from '@/settings/account/types/Account';
import { Form } from 'erxes-ui';
import { ITransactionGroupForm } from '../../../types/JournalForms';

export const FxaSaleAccountFields = ({
  form,
  index,
  onFixedAssetAccountChange,
  showFixedAssetAccount = false,
  showGainAccount = true,
}: {
  form: ITransactionGroupForm;
  index: number;
  onFixedAssetAccountChange?: (account: IAccount) => void;
  showFixedAssetAccount?: boolean;
  showGainAccount?: boolean;
}) => (
  <>
    {showFixedAssetAccount && (
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
                onCallback={onFixedAssetAccountChange}
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
    )}
    <Form.Field
      control={form.control}
      name={`trDocs.${index}.followInfos.accumulatedDepreciationAccountId`}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Хуримтлагдсан элэгдлийн данс</Form.Label>
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
    {showGainAccount && (
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
                defaultFilter={{
                  journals: [JournalEnum.FXA_FOLLOW],
                  permissionMode: 'write',
                }}
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
    )}
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
              defaultFilter={{
                journals: [JournalEnum.FXA_FOLLOW],
                permissionMode: 'write',
              }}
            />
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
  </>
);

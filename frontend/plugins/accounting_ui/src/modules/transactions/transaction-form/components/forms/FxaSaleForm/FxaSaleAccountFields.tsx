import { SelectAccount } from '@/settings/account/components/SelectAccount';
import { IAccount, JournalEnum } from '@/settings/account/types/Account';
import { Form } from 'erxes-ui';
import { ITransactionGroupForm } from '../../../types/JournalForms';

export const FxaSaleAccountFields = ({
  form,
  index,
  onFixedAssetAccountChange,
  showSaleAccounts = false,
}: {
  form: ITransactionGroupForm;
  index: number;
  onFixedAssetAccountChange?: (account: IAccount) => void;
  showSaleAccounts?: boolean;
}) => (
  <>
    {showSaleAccounts && (
      <Form.Field
        control={form.control}
        name={`trDocs.${index}.followInfos.saleOutAccountId`}
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Хөрөнгө хасах данс</Form.Label>
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
    {showSaleAccounts && (
      <Form.Field
        control={form.control}
        name={`trDocs.${index}.followInfos.saleCostAccountId`}
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Өртөг/алдагдлын данс</Form.Label>
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
  </>
);

import { SelectAccount } from '@/settings/account/components/SelectAccount';
import { JournalEnum } from '@/settings/account/types/Account';
import { Form } from 'erxes-ui';
import { ITransactionGroupForm } from '../../../types/JournalForms';
import { SelectBranches, SelectDepartments } from 'ui-modules';

export const FxaMoveAccountFields = ({
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
      name={`trDocs.${index}.followInfos.moveInBranchId`}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Очих салбар</Form.Label>
          <Form.Control>
            <SelectBranches.FormItem
              value={field.value}
              onValueChange={field.onChange}
            />
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
    <Form.Field
      control={form.control}
      name={`trDocs.${index}.followInfos.moveInDepartmentId`}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Очих хэлтэс</Form.Label>
          <Form.Control>
            <SelectDepartments.FormItem
              value={field.value}
              onValueChange={field.onChange}
            />
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
  </>
);

import { SelectAccount } from '@/settings/account/components/SelectAccount';
import { Form } from 'erxes-ui';
import { ITransactionGroupForm } from '../../../types/JournalForms';

export const FxaSaleAccountFields = ({
  form,
  index,
}: {
  form: ITransactionGroupForm;
  index: number;
}) => (
  <>
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

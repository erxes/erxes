import { Form } from 'erxes-ui';
import { SelectBranches, SelectDepartments } from 'ui-modules';
import { ITransactionGroupForm } from '../../../types/JournalForms';

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

import { AccountingHotkeyScope } from '@/types/AccountingHotkeyScope';
import {
  Form,
  RecordTableHotKeyControl,
  RecordTableInlineCell,
  Table,
} from 'erxes-ui';
import { SelectBranches, SelectDepartments } from 'ui-modules';
import { ITransactionGroupForm } from '../../types/JournalForms';

export const FxaDetailLocationCells = ({
  detailId,
  detailIndex,
  form,
  journalIndex,
}: {
  detailId?: string;
  detailIndex: number;
  form: ITransactionGroupForm;
  journalIndex: number;
}) => {
  const rowId = detailId || '';

  return (
    <>
      <RecordTableHotKeyControl
        rowId={rowId}
        rowIndex={detailIndex}
        enableOnFormTags
      >
        <Table.Cell>
          <RecordTableInlineCell className="justify-center">
            <Form.Field
              control={form.control}
              name={`trDocs.${journalIndex}.details.${detailIndex}.branchId`}
              render={({ field }) => (
                <Form.Item>
                  <Form.Control>
                    <SelectBranches.InlineCell
                      mode="single"
                      value={field.value ?? ''}
                      onValueChange={(branch) => field.onChange(branch)}
                      scope={AccountingHotkeyScope.TransactionFormPage}
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </RecordTableInlineCell>
        </Table.Cell>
      </RecordTableHotKeyControl>
      <RecordTableHotKeyControl
        rowId={rowId}
        rowIndex={detailIndex}
        enableOnFormTags
      >
        <Table.Cell>
          <RecordTableInlineCell className="justify-center">
            <Form.Field
              control={form.control}
              name={`trDocs.${journalIndex}.details.${detailIndex}.departmentId`}
              render={({ field }) => (
                <Form.Item>
                  <Form.Control>
                    <SelectDepartments.InlineCell
                      mode="single"
                      value={field.value ?? ''}
                      onValueChange={(department) => field.onChange(department)}
                      scope={AccountingHotkeyScope.TransactionFormPage}
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </RecordTableInlineCell>
        </Table.Cell>
      </RecordTableHotKeyControl>
    </>
  );
};

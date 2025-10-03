import { AccountingHotkeyScope } from '@/types/AccountingHotkeyScope';
import { Checkbox, RecordTableHotkeyProvider, Table, useSetHotkeyScope } from 'erxes-ui';
import { useRef } from 'react';
import { useFieldArray, useWatch } from 'react-hook-form';
import { ITransactionGroupForm } from '../../../types/JournalForms';
import { AddDetailRowButton } from './AddInventoryRow';
import { InventoryRow } from './InventoryRow';
import { RemoveButton } from './RemoveButton';

export const InventoryForm = ({
  form,
  journalIndex,
}: {
  form: ITransactionGroupForm;
  journalIndex: number;
}) => {
  const { fields, append } = useFieldArray({
    control: form.control,
    name: `trDocs.${journalIndex}.details`,
  });
  const setHotkeyScope = useSetHotkeyScope()

  const tableRef = useRef<HTMLTableElement>(null);

  const columnsLength =
    tableRef.current?.querySelector('tr')?.querySelectorAll('td, th').length ||
    5;

  return (
    <RecordTableHotkeyProvider
      columnLength={columnsLength}
      rowLength={fields.length}
      scope={AccountingHotkeyScope.TransactionFormPage}
    >
      <Table
        className="mt-5 p-1 overflow-hidden rounded-lg bg-sidebar border-sidebar"
        ref={tableRef}
        onClickCapture={() => setHotkeyScope(AccountingHotkeyScope.TransactionFormPage)}
      >
        <InventoryTableHeader form={form} journalIndex={journalIndex} />
        <Table.Body className="overflow-hidden">
          {fields.map((product, detailIndex) => (
            <InventoryRow
              key={product.id}
              detailIndex={detailIndex}
              journalIndex={journalIndex}
              form={form}
            />
          ))}
        </Table.Body>
        <Table.Footer>
          <tr>
            <td colSpan={columnsLength} className="p-4">
              <div className="flex w-full justify-center gap-4">
                <AddDetailRowButton
                  append={append}
                  form={form}
                  journalIndex={journalIndex}
                />
                <RemoveButton form={form} journalIndex={journalIndex} />
              </div>
            </td>
          </tr>
        </Table.Footer>
      </Table>
    </RecordTableHotkeyProvider>
  );
};

const InventoryTableHeader = ({
  form,
  journalIndex,
}: {
  form: ITransactionGroupForm;
  journalIndex: number;
}) => {
  const trDoc = useWatch({
    control: form.control,
    name: `trDocs.${journalIndex}`,
  });

  return (
    <Table.Header>
      <Table.Row>
        <Table.Head className='w-10'>
          <div className="flex items-center justify-center">
            <Checkbox
              checked={!trDoc.details.filter(d => !d.checked).length}
              onCheckedChange={(checked) => {
                trDoc.details.forEach((_d, ind) => {
                  form.setValue(
                    `trDocs.${journalIndex}.details.${ind}.checked`,
                    !!checked,
                  );
                });
              }}
            />
          </div>
        </Table.Head>
        <Table.Head>Account</Table.Head>
        <Table.Head>Inventory</Table.Head>
        <Table.Head>Quantity</Table.Head>
        <Table.Head>Unit Price</Table.Head>
        <Table.Head>Amount</Table.Head>
      </Table.Row>
    </Table.Header>
  );
};

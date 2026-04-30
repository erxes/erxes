import { AccountingHotkeyScope } from '@/types/AccountingHotkeyScope';
import {
  Checkbox,
  RecordTableHotkeyProvider,
  ScrollArea,
  Table,
  useSetHotkeyScope,
} from 'erxes-ui';
import { useRef } from 'react';
import { useFieldArray, useWatch } from 'react-hook-form';
import {
  ITransactionGroupForm,
  TInvMoveJournal,
} from '../../../types/JournalForms';
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
  const setHotkeyScope = useSetHotkeyScope();

  const tableRef = useRef<HTMLTableElement>(null);

  const columnsLength =
    tableRef.current?.querySelector('tr')?.querySelectorAll('td, th').length ||
    5;

  return (
    <>
      <RecordTableHotkeyProvider
        columnLength={columnsLength}
        rowLength={fields.length}
        scope={AccountingHotkeyScope.TransactionFormPage}
      >
        <ScrollArea
          scrollBarClassName="z-10"
          className="h-full w-full pb-3 pr-3"
        >
          <Table
            className="mt-5 p-1 overflow-hidden rounded-lg bg-sidebar border-sidebar w-max min-w-full"
            ref={tableRef}
            onClickCapture={() =>
              setHotkeyScope(AccountingHotkeyScope.TransactionFormPage)
            }
          >
            <InventoryTableHeader form={form} journalIndex={journalIndex} />
            <Table.Body className="overflow-hidden">
              {fields.map((detail, detailIndex) => (
                <InventoryRow
                  key={detail._id}
                  detailIndex={detailIndex}
                  journalIndex={journalIndex}
                  form={form}
                />
              ))}
            </Table.Body>
          </Table>
          <ScrollArea.Bar orientation="horizontal" className="z-10" />
        </ScrollArea>
      </RecordTableHotkeyProvider>
      <div className="flex w-full justify-center gap-4">
        <AddDetailRowButton
          append={append}
          form={form}
          journalIndex={journalIndex}
        />
        <RemoveButton form={form} journalIndex={journalIndex} />
      </div>
    </>
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
  }) as TInvMoveJournal;

  return (
    <Table.Header>
      <Table.Row>
        <Table.Head className="w-10">
          <div className="flex items-center justify-center">
            <Checkbox
              checked={!trDoc.details.filter((d) => !d.checked).length}
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
        <Table.Head>Данс</Table.Head>
        <Table.Head>Бараа</Table.Head>
        <Table.Head>Тоо хэмжээ</Table.Head>
        <Table.Head>Нэгж үнэ</Table.Head>
        <Table.Head>Дүн</Table.Head>
      </Table.Row>
    </Table.Header>
  );
};

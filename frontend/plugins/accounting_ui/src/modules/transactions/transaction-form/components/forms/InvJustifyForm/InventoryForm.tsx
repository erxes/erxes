import { AccountingHotkeyScope } from '@/types/AccountingHotkeyScope';
import {
  Checkbox,
  Label,
  RecordTableHotkeyProvider,
  ScrollArea,
  Switch,
  Table,
  useSetHotkeyScope,
} from 'erxes-ui';
import { useAtom, useAtomValue } from 'jotai';
import { useRef } from 'react';
import { useFieldArray, useWatch } from 'react-hook-form';
import { showAdvancedViewState } from '../../../states/trStates';
import {
  ITransactionGroupForm,
  TInvJustifyJournal,
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
  const [showAdvancedView, setShowAdvancedView] = useAtom(
    showAdvancedViewState,
  );
  const columnsLength =
    tableRef.current?.querySelector('tr')?.querySelectorAll('td, th').length ||
    8;

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
                  key={detail.id}
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
        <div>
          <Label className="mr-3">Дэлгэрэнгүй харагдац</Label>
          <Switch
            checked={showAdvancedView}
            onCheckedChange={setShowAdvancedView}
          />
        </div>
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
  const showAdvancedView = useAtomValue(showAdvancedViewState);
  const trDoc = useWatch({
    control: form.control,
    name: `trDocs.${journalIndex}`,
  }) as TInvJustifyJournal;

  return (
    <Table.Header>
      <Table.Row>
        <Table.Head className="w-10">
          <div className="flex items-center justify-center">
            <Checkbox
              checked={!trDoc.details.some((detail) => !detail.checked)}
              onCheckedChange={(checked) =>
                trDoc.details.forEach((_detail, detailIndex) =>
                  form.setValue(
                    `trDocs.${journalIndex}.details.${detailIndex}.checked`,
                    !!checked,
                  ),
                )
              }
            />
          </div>
        </Table.Head>
        <Table.Head>Данс</Table.Head>
        <Table.Head>Бараа материал</Table.Head>
        <Table.Head>Одоогийн үлдэгдэл</Table.Head>
        <Table.Head>Одоогийн нэгж өртөг</Table.Head>
        <Table.Head>Залруулах нэгж өртөг</Table.Head>
        <Table.Head>Дараах нэгж өртөг</Table.Head>
        <Table.Head>Дүн</Table.Head>
        {showAdvancedView && (
          <>
            <Table.Head>Салбар</Table.Head>
            <Table.Head>Хэлтэс</Table.Head>
          </>
        )}
      </Table.Row>
    </Table.Header>
  );
};

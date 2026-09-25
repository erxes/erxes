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
  TInvOutJournal,
} from '../../../types/JournalForms';
import { AddDetailRowButton } from './AddInventoryRow';
import { InventoryRow } from './InventoryRow';
import { RemoveButton } from './RemoveButton';

export const InventoryForm = ({
  form,
  journalIndex,
  isJustify,
}: {
  form: ITransactionGroupForm;
  journalIndex: number;
  isJustify?: boolean;
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
            <InventoryTableHeader
              form={form}
              journalIndex={journalIndex}
              isJustify={isJustify}
            />
            <Table.Body className="overflow-hidden">
              {fields.map((product, detailIndex) => (
                <InventoryRow
                  key={product.id}
                  detailIndex={detailIndex}
                  journalIndex={journalIndex}
                  form={form}
                  isJustify={isJustify}
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
          isJustify={isJustify}
        />
        <RemoveButton form={form} journalIndex={journalIndex} />
        <div>
          <Label className="mr-3">Дэлгэрэнгүй харагдац</Label>
          <Switch
            checked={showAdvancedView}
            onCheckedChange={(checked) => {
              setShowAdvancedView(checked);
            }}
          />
        </div>
      </div>
    </>
  );
};

const InventoryTableHeader = ({
  form,
  journalIndex,
  isJustify,
}: {
  form: ITransactionGroupForm;
  journalIndex: number;
  isJustify?: boolean;
}) => {
  const showAdvancedView = useAtomValue(showAdvancedViewState);
  const trDoc = useWatch({
    control: form.control,
    name: `trDocs.${journalIndex}`,
  }) as TInvOutJournal;

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
        <Table.Head>Бараа материал</Table.Head>
        {isJustify ? (
          <>
            <Table.Head>Одоогийн үлдэгдэл</Table.Head>
            <Table.Head>Одоогийн нэгж өртөг</Table.Head>
            <Table.Head>Залруулах нэгж өртөг</Table.Head>
            <Table.Head>Дараах нэгж өртөг</Table.Head>
          </>
        ) : (
          <>
            <Table.Head>Тоо хэмжээ</Table.Head>
            <Table.Head>Нэгж үнэ</Table.Head>
          </>
        )}
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

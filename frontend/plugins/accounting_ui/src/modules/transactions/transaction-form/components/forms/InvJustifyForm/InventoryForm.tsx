import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('accounting');

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
          <Label className="mr-3">{t('detailed-view')}</Label>
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
  const { t } = useTranslation('accounting');

  const showAdvancedView = useAtomValue(showAdvancedViewState);
  const trDoc = useWatch({
    control: form.control,
    name: `trDocs.${journalIndex}`,
  }) as TInvJustifyJournal;

  return (
    <Table.Header>
      <Table.Row>
        <Table.Head className="w-8">
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
        <Table.Head>{t('account')}</Table.Head>
        <Table.Head>{t('inventory')}</Table.Head>
        <Table.Head>{t('current-quantity')}</Table.Head>
        <Table.Head>{t('current-unit-cost')}</Table.Head>
        <Table.Head>{t('unit-cost-adjustment')}</Table.Head>
        <Table.Head>{t('adjusted-unit-cost')}</Table.Head>
        <Table.Head>{t('amount')}</Table.Head>
        {showAdvancedView && (
          <>
            <Table.Head>{t('branch')}</Table.Head>
            <Table.Head>{t('department')}</Table.Head>
          </>
        )}
      </Table.Row>
    </Table.Header>
  );
};

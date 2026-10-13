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
import { useEffect, useRef } from 'react';
import { useFieldArray, useWatch } from 'react-hook-form';
import { ITrDetail } from '~/modules/transactions/types/Transaction';
import { showAdvancedViewState } from '../../../states/trStates';
import {
  ITransactionGroupForm,
  TInvSaleJournal,
} from '../../../types/JournalForms';
import { AddDetailRowButton } from './AddInventoryRow';
import { InventoryRow } from './InventoryRow';
import { RemoveButton } from './RemoveButton';

export const InventoryForm = ({
  form,
  journalIndex,
  replaceDetails,
}: {
  form: ITransactionGroupForm;
  journalIndex: number;
  replaceDetails: ITrDetail[];
}) => {
  const { t } = useTranslation('accounting');
  const { fields, append, replace } = useFieldArray({
    control: form.control,
    name: `trDocs.${journalIndex}.details`,
  });

  useEffect(() => {
    if (replaceDetails) {
      replace(replaceDetails as any[]);
    }
  }, [replaceDetails, replace]);

  const setHotkeyScope = useSetHotkeyScope();

  const tableRef = useRef<HTMLTableElement>(null);
  const prefilledUnitCosts = useRef<Record<string, number>>({});
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
            <InventoryTableHeader form={form} journalIndex={journalIndex} />
            <Table.Body className="overflow-hidden">
              {fields.map((detail, detailIndex) => (
                <InventoryRow
                  key={detail._id}
                  detailIndex={detailIndex}
                  journalIndex={journalIndex}
                  form={form}
                  initialUnitCost={prefilledUnitCosts.current[detail._id]}
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
          setPrefilledUnitCosts={(unitCosts) => {
            Object.assign(prefilledUnitCosts.current, unitCosts);
          }}
        />
        <RemoveButton form={form} journalIndex={journalIndex} />
        <div>
          <Label className="mr-3">{t('detailed-view')}</Label>
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
}: {
  form: ITransactionGroupForm;
  journalIndex: number;
}) => {
  const { t } = useTranslation('accounting');
  const showAdvancedView = useAtomValue(showAdvancedViewState);
  const trDoc = useWatch({
    control: form.control,
    name: `trDocs.${journalIndex}`,
  }) as TInvSaleJournal;

  return (
    <Table.Header>
      <Table.Row>
        <Table.Head className="w-8">
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
        <Table.Head>{t('account')}</Table.Head>
        <Table.Head>{t('inventory-label')}</Table.Head>
        <Table.Head>{t('quantity-label')}</Table.Head>
        <Table.Head>{t('unit-price')}</Table.Head>
        <Table.Head>{t('amount')}</Table.Head>
        {trDoc.hasVat && <Table.Head>{t('vat')}</Table.Head>}
        {trDoc.hasCtax && <Table.Head>{t('city-tax')}</Table.Head>}
        {(trDoc.hasVat || trDoc.hasCtax) && (
          <>
            <Table.Head>{t('unit-price-including-tax')}</Table.Head>
            <Table.Head>{t('amount-including-tax')}</Table.Head>
          </>
        )}
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

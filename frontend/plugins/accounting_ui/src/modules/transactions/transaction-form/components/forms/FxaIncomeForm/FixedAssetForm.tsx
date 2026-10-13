import { useTranslation } from 'react-i18next';
import { AccountingHotkeyScope } from '@/types/AccountingHotkeyScope';
import {
  Button,
  Checkbox,
  Label,
  RecordTableHotkeyProvider,
  ScrollArea,
  Switch,
  Table,
  useSetHotkeyScope,
} from 'erxes-ui';
import { useAtom, useAtomValue } from 'jotai';
import { IconPlus, IconX } from '@tabler/icons-react';
import { useRef } from 'react';
import { useFieldArray, useWatch } from 'react-hook-form';
import {
  ITransactionGroupForm,
  TFxaDetail,
  TFxaIncomeJournal,
} from '../../../types/JournalForms';
import { getFxaDetailDefaultValues } from '../../helpers/fxaHelpers';
import { showAdvancedViewState } from '../../../states/trStates';
import { FixedAssetRow } from './FixedAssetRow';

export const FixedAssetForm = ({
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
  const details =
    (useWatch({
      control: form.control,
      name: `trDocs.${journalIndex}.details`,
    }) as TFxaDetail[] | undefined) || [];
  const setHotkeyScope = useSetHotkeyScope();
  const tableRef = useRef<HTMLTableElement>(null);
  const columnsLength =
    tableRef.current?.querySelector('tr')?.querySelectorAll('td, th').length ||
    6;
  const hasCheckedDetails = details.some((detail) => detail.checked);
  const [showAdvancedView, setShowAdvancedView] = useAtom(
    showAdvancedViewState,
  );

  const removeChecked = () => {
    form.setValue(
      `trDocs.${journalIndex}.details`,
      details.filter((detail) => !detail.checked),
    );
  };

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
            ref={tableRef}
            className="mt-5 p-1 overflow-hidden rounded-lg bg-sidebar border-sidebar w-max min-w-full"
            onClickCapture={() =>
              setHotkeyScope(AccountingHotkeyScope.TransactionFormPage)
            }
          >
            <FixedAssetTableHeader
              form={form}
              journalIndex={journalIndex}
              details={details}
            />
            <Table.Body className="overflow-hidden">
              {fields.map((detail, detailIndex) => (
                <FixedAssetRow
                  key={detail.id}
                  form={form}
                  journalIndex={journalIndex}
                  detailIndex={detailIndex}
                />
              ))}
            </Table.Body>
          </Table>
          <ScrollArea.Bar orientation="horizontal" className="z-10" />
        </ScrollArea>
      </RecordTableHotkeyProvider>

      <div className="flex justify-center gap-3">
        <Button
          type="button"
          variant="secondary"
          className="bg-border"
          onClick={() =>
            append(
              getFxaDetailDefaultValues({ accountId: details[0]?.accountId }),
            )
          }
        >
          <IconPlus />
          {t('new-row')}
        </Button>
        {hasCheckedDetails && (
          <Button
            type="button"
            variant="secondary"
            className="bg-destructive/10 text-destructive"
            onClick={removeChecked}
          >
            <IconX />
            {t('remove-selected')}
          </Button>
        )}
        <div className="flex items-center">
          <Label className="mr-3">{t('detailed-view')}</Label>
          <Switch
            checked={showAdvancedView}
            onCheckedChange={(checked) => setShowAdvancedView(checked)}
          />
        </div>
      </div>
    </>
  );
};

const FixedAssetTableHeader = ({
  form,
  journalIndex,
  details,
}: {
  form: ITransactionGroupForm;
  journalIndex: number;
  details: TFxaDetail[];
}) => {
  const { t } = useTranslation('accounting');
  const trDoc = useWatch({
    control: form.control,
    name: `trDocs.${journalIndex}`,
  }) as TFxaIncomeJournal | undefined;
  const showAdvancedView = useAtomValue(showAdvancedViewState);
  const isAllChecked =
    details.length > 0 && details.every((detail) => detail.checked);

  return (
    <Table.Header>
      <Table.Row>
        <Table.Head className="w-8" />
        <Table.Head className="w-8">
          <div className="flex items-center justify-center">
            <Checkbox
              checked={isAllChecked}
              onCheckedChange={(checked) => {
                details.forEach((_detail, detailIndex) => {
                  form.setValue(
                    `trDocs.${journalIndex}.details.${detailIndex}.checked`,
                    Boolean(checked),
                  );
                });
              }}
            />
          </div>
        </Table.Head>
        <Table.Head>{t('category-label')}</Table.Head>
        <Table.Head>{t('code')}</Table.Head>
        <Table.Head>{t('name')}</Table.Head>
        <Table.Head>{t('quantity-label')}</Table.Head>
        <Table.Head>{t('unit-price')}</Table.Head>
        <Table.Head>{t('amount')}</Table.Head>
        {trDoc?.hasVat && <Table.Head>{t('vat')}</Table.Head>}
        {trDoc?.hasCtax && <Table.Head>{t('city-tax')}</Table.Head>}
        {(trDoc?.hasVat || trDoc?.hasCtax) && (
          <>
            <Table.Head>{t('unit-price-including-tax')}</Table.Head>
            <Table.Head>{t('amount-including-tax')}</Table.Head>
          </>
        )}
        {showAdvancedView && (
          <>
            <Table.Head>{t('accumulated-depreciation')}</Table.Head>
            <Table.Head>{t('branch')}</Table.Head>
            <Table.Head>{t('department')}</Table.Head>
          </>
        )}
      </Table.Row>
    </Table.Header>
  );
};

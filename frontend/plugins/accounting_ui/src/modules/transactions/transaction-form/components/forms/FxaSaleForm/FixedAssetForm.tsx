import { useTranslation } from 'react-i18next';
import { AccountingHotkeyScope } from '@/types/AccountingHotkeyScope';
import { IconX } from '@tabler/icons-react';
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
import { useRef } from 'react';
import { useFieldArray, useWatch } from 'react-hook-form';
import { ITransactionGroupForm, TFxaDetail } from '../../../types/JournalForms';
import { showAdvancedViewState } from '../../../states/trStates';
import { AddFixedAssetRow } from './AddFixedAssetRow';
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
    7;
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
        <AddFixedAssetRow
          append={append}
          form={form}
          journalIndex={journalIndex}
        />
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
  const isAllChecked =
    details.length > 0 && details.every((detail) => detail.checked);
  const showAdvancedView = useAtomValue(showAdvancedViewState);

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
        <Table.Head>{t('fixed-asset')}</Table.Head>
        <Table.Head>{t('quantity-label')}</Table.Head>
        <Table.Head>{t('unit-price')}</Table.Head>
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

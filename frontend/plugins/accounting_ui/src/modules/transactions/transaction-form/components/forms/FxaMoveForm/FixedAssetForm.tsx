import { AccountingHotkeyScope } from '@/types/AccountingHotkeyScope';
import { IconPlus, IconX } from '@tabler/icons-react';
import {
  Button,
  Checkbox,
  RecordTableHotkeyProvider,
  ScrollArea,
  Table,
  useSetHotkeyScope,
} from 'erxes-ui';
import { useRef } from 'react';
import { useFieldArray, useWatch } from 'react-hook-form';
import { ITransactionGroupForm, TFxaDetail } from '../../../types/JournalForms';
import { getTempId } from '../../utils';
import { FixedAssetRow } from './FixedAssetRow';

const getFxaDetailDefaultValues = (
  detail?: Partial<TFxaDetail>,
): TFxaDetail => ({
  ...(detail || {}),
  _id: getTempId(),
  accountId: detail?.accountId || '',
  fixedAssetId: detail?.fixedAssetId || '',
  count: detail?.count ?? 0,
  unitPrice: detail?.unitPrice ?? 0,
  amount: detail?.amount ?? 0,
  checked: false,
});

export const FixedAssetForm = ({
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
  const details = useWatch({
    control: form.control,
    name: `trDocs.${journalIndex}.details`,
  }) as TFxaDetail[];
  const setHotkeyScope = useSetHotkeyScope();
  const tableRef = useRef<HTMLTableElement>(null);
  const columnsLength =
    tableRef.current?.querySelector('tr')?.querySelectorAll('td, th').length ||
    6;
  const hasCheckedDetails = details.some((detail) => detail.checked);

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
          Шинэ мөр
        </Button>
        {hasCheckedDetails && (
          <Button
            type="button"
            variant="secondary"
            className="bg-destructive/10 text-destructive"
            onClick={removeChecked}
          >
            <IconX />
            Сонгосныг хасах
          </Button>
        )}
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
  const isAllChecked =
    details.length > 0 && details.every((detail) => detail.checked);

  return (
    <Table.Header>
      <Table.Row>
        <Table.Head className="w-10" />
        <Table.Head className="w-10">
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
        <Table.Head>Үндсэн хөрөнгө</Table.Head>
        <Table.Head>Тоо хэмжээ</Table.Head>
        <Table.Head>Нэгж үнэ</Table.Head>
        <Table.Head>Дүн</Table.Head>
      </Table.Row>
    </Table.Header>
  );
};

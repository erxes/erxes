import { IconPlus, IconZoomCancel, IconZoomIn } from '@tabler/icons-react';
import { Button, RecordTableHotkeyProvider, Table, usePreviousHotkeyScope } from 'erxes-ui';
import { useFieldArray } from 'react-hook-form';
import { ITransactionGroupForm } from '../../../types/JournalForms';
import { ExpenseRow } from './ExpenseRow';
import { AccountingHotkeyScope } from '@/types/AccountingHotkeyScope';
import { useState } from 'react';
import { getTempId } from '../../utils';

export const ExpenseForm = ({
  form,
  journalIndex,
}: {
  form: ITransactionGroupForm;
  journalIndex: number;
}) => {
  const [isShow, setIsShow] = useState(false);
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope()

  const { fields, append } = useFieldArray({
    control: form.control,
    name: `trDocs.${journalIndex}.extraData.invIncomeExpenses`,
    keyName: '_id'
  });

  const handleAppend = () => {
    append({
      _id: getTempId(),
      amount: 0,
      title: '',
      rule: 'amount'
    })
  }

  if (!isShow) {
    return (
      <Button
        variant="link"
        className="bg-border"
        onClick={() => setIsShow(true)}
      >
        <IconZoomIn />
        {`Show expenses (${fields.length})`}
      </Button>
    );
  }

  return (
    <RecordTableHotkeyProvider
      columnLength={5}
      rowLength={fields.length}
      scope={AccountingHotkeyScope.TransactionFormSubPage}
    >
      <Table className="mt-8 p-1 overflow-hidden rounded-lg bg-sidebar border-sidebar" onClickCapture={() => setHotkeyScopeAndMemorizePreviousScope(AccountingHotkeyScope.TransactionFormSubPage)} >
        <ExpenseTableHeader form={form} journalIndex={journalIndex} />
        <Table.Body className="overflow-hidden">
          {fields.map((expense, expenseIndex) => (
            <ExpenseRow
              key={expense._id}
              expenseIndex={expenseIndex}
              journalIndex={journalIndex}
              form={form}
            />
          ))}
        </Table.Body>
        <Table.Footer>
          <tr>
            <td colSpan={5} className="p-4">
              <div className="flex w-full justify-center gap-4">
                <Button
                  variant="secondary"
                  className="bg-border"
                  onClick={handleAppend}
                >
                  <IconPlus />
                  {`Add expense`}
                </Button>
                <Button
                  variant="link"
                  className="bg-border"
                  onClick={() => setIsShow(false)}
                >
                  <IconZoomCancel />
                  {`Hide expenses`}
                </Button>
              </div>
            </td>
          </tr>
        </Table.Footer>
      </Table>
    </RecordTableHotkeyProvider>
  );
};

const ExpenseTableHeader = ({
  form,
  journalIndex,
}: {
  form: ITransactionGroupForm;
  journalIndex: number;
}) => {
  return (
    <Table.Header>
      <Table.Row>
        <Table.Head className='w-10'></Table.Head>
        <Table.Head>Expense</Table.Head>
        <Table.Head>Rule</Table.Head>
        <Table.Head>Amount</Table.Head>
        <Table.Head>Account</Table.Head>
      </Table.Row>
    </Table.Header>
  );
};

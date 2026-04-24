import { AccountingHeader } from '@/layout/components/Header';
import { AccountingLayout } from '@/layout/components/Layout';
import { AddTransaction } from '@/transactions/components/AddTransaction';
import { TransactionTable } from '@/transactions/components/TransactionTable';
import { TransactionsFilter } from '@/transactions/components/TrFilters';
import { IconPlus } from '@tabler/icons-react';
import { Button, Kbd, PageSubHeader, Separator } from 'erxes-ui';
import { Import } from 'ui-modules';
import { TrsTotalCount } from '~/modules/transactions/components/TrsTotalCount';
import { ORIGIN_TR_JOURNALS } from '~/modules/transactions/types/constants';
import { TR_JOURNAL_LABELS } from '../modules/transactions/types/constants';


export const TransactionListPage = () => {
  const renderAdditionHelper = () => {
    return (
      <div>
        <p>
          ** бүхий баганад нэг ажил гүйлгээний хувьд нэг л бөглөн.
        </p>
        <p>
          * бүхий баганад олон бичилттэй баримтын хувьд нэг л мөр нь бөглөгдөнө. Хоосон бол өмнөх мөрийн үргэлжлэл баримт гэж ойлгоно.
        </p>
        <p>Журнал баганад боломжтой утгууд:</p>
        <ul className="list-disc pl-5 space-y-1">
          {ORIGIN_TR_JOURNALS.map((j) => (
            <li key={j}>{`${TR_JOURNAL_LABELS[j]} - ${j}`}</li>
          ))}
        </ul>
        <Separator />
        <p>Нэмэлт мэдээллийн талбарууд шаардлагатай журнал бүрээр:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            Гадаад валютын гүйлгээ:
            <ul className="list-[circle] pl-5 mt-1 space-y-1">
              <li>Condition Field 1: Ханшийн зөрүүний данс</li>
            </ul>
          </li>
          <li>
            Дотоод хөдөлгөөн:
            <ul className="list-[circle] pl-5 mt-1 space-y-1">
              <li>Condition Field 1: Шилжүүлэх данс</li>
              <li>Condition Field 2: Шилжүүлэх салбар</li>
              <li>Condition Field 3: Шилжүүлэх хэлтэс</li>
            </ul>
          </li>
          <li>
            Борлуулалт:
            <ul className="list-[circle] pl-5 mt-1 space-y-1">
              <li>Condition Field 1: Бэлэн бүтээгдэхүүний данс</li>
              <li>Condition Field 2: ББӨ данс</li>
            </ul>
          </li>
          <li>
            Борлуулалтын буцаалт:
            <ul className="list-[circle] pl-5 mt-1 space-y-1">
              <li>Condition Field 1: Буцаах баримтын дугаар</li>
              <li>Condition Field 2: Бэлэн бүтээгдэхүүний данс</li>
              <li>Condition Field 3: ББӨ данс</li>
            </ul>
          </li>
        </ul>
        <Separator />
      </div>
    );
  };

  return (
    <AccountingLayout>
      <AccountingHeader>
        <div className="px-3">
          <AddTransaction>
            <Button>
              <IconPlus />
              Add Transaction
              <Kbd>C</Kbd>
            </Button>
          </AddTransaction>
        </div>
      </AccountingHeader>
      <PageSubHeader>
        <TransactionsFilter afterBar={<TrsTotalCount />} />
        <Import
          pluginName="accounting"
          moduleName="account"
          collectionName="transactions"
          title='Import Transactions'
          additionContent={renderAdditionHelper}
        />
      </PageSubHeader>
      <TransactionTable />
    </AccountingLayout>
  );
};

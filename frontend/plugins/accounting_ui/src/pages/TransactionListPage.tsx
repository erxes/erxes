import { AccountingHeader } from '@/layout/components/Header';
import { AccountingLayout } from '@/layout/components/Layout';
import { AddTransaction } from '@/transactions/components/AddTransaction';
import { TransactionTable } from '@/transactions/components/TransactionTable';
import { TransactionsFilter } from '@/transactions/components/TrFilters';
import { IconPlus } from '@tabler/icons-react';
import { Button, Kbd, PageSubHeader, Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Import } from 'ui-modules';
import { TrsTotalCount } from '~/modules/transactions/components/TrsTotalCount';
import { ORIGIN_TR_JOURNALS } from '~/modules/transactions/types/constants';
import { TR_JOURNAL_LABELS } from '../modules/transactions/types/constants';

export const TransactionListPage = () => {
  const { t } = useTranslation();

  const renderAdditionHelper = () => {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
          <h4 className="text-sm font-semibold">{t('Тэмдэгтийн тайлбар')}</h4>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-md border bg-background p-3">
              <p className="text-xs font-mono font-semibold text-primary">**</p>
              <p className="text-sm mt-1">
                {t('Нэг ажил гүйлгээний хувьд нэг л бөглөнө.')}
              </p>
            </div>
            <div className="rounded-md border bg-background p-3">
              <p className="text-xs font-mono font-semibold text-primary">*</p>
              <p className="text-sm mt-1">
                {t(
                  'Олон бичилттэй баримтын хувьд нэг л мөр нь бөглөгдөнө. Хоосон бол өмнөх мөрийн үргэлжлэл баримт гэж ойлгогдоно.',
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold">
            {t('Журнал баганад боломжтой утгууд')}
          </h4>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {ORIGIN_TR_JOURNALS.map((j) => (
              <div
                key={j}
                className="flex items-center justify-between rounded-md border bg-background px-3 py-2"
              >
                <span className="text-sm">{TR_JOURNAL_LABELS[j]}</span>
                <span className="text-xs font-mono rounded bg-muted px-2 py-0.5 text-muted-foreground">
                  {j}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <h4 className="text-sm font-semibold">
            {t('Нэмэлт мэдээллийн талбарууд (журнал бүрээр)')}
          </h4>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-3 space-y-2">
              <p className="text-sm font-medium">
                {t('Гадаад валютын гүйлгээ')}
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>
                  <span className="font-mono text-xs rounded bg-muted px-1.5 py-0.5 mr-2">
                    CF1
                  </span>
                  <span>{t('Ханшийн зөрүүний данс')}</span>
                </li>
              </ul>
            </div>
            <div className="rounded-lg border p-3 space-y-2">
              <p className="text-sm font-medium">{t('Дотоод хөдөлгөөн')}</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>
                  <span className="font-mono text-xs rounded bg-muted px-1.5 py-0.5 mr-2">
                    CF1
                  </span>
                  <span>{t('Шилжүүлэх данс')}</span>
                </li>
                <li>
                  <span className="font-mono text-xs rounded bg-muted px-1.5 py-0.5 mr-2">
                    CF2
                  </span>
                  <span>{t('Шилжүүлэх салбар')}</span>
                </li>
                <li>
                  <span className="font-mono text-xs rounded bg-muted px-1.5 py-0.5 mr-2">
                    CF3
                  </span>
                  <span>{t('Шилжүүлэх хэлтэс')}</span>
                </li>
              </ul>
            </div>
            <div className="rounded-lg border p-3 space-y-2">
              <p className="text-sm font-medium">{t('Борлуулалт')}</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>
                  <span className="font-mono text-xs rounded bg-muted px-1.5 py-0.5 mr-2">
                    CF1
                  </span>
                  <span>{t('Бэлэн бүтээгдэхүүний данс')}</span>
                </li>
                <li>
                  <span className="font-mono text-xs rounded bg-muted px-1.5 py-0.5 mr-2">
                    CF2
                  </span>
                  <span>{t('ББӨ данс')}</span>
                </li>
              </ul>
            </div>
            <div className="rounded-lg border p-3 space-y-2">
              <p className="text-sm font-medium">{t('Борлуулалтын буцаалт')}</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>
                  <span className="font-mono text-xs rounded bg-muted px-1.5 py-0.5 mr-2">
                    CF1
                  </span>
                  <span>{t('Буцаах баримтын дугаар')}</span>
                </li>
                <li>
                  <span className="font-mono text-xs rounded bg-muted px-1.5 py-0.5 mr-2">
                    CF2
                  </span>
                  <span>{t('Бэлэн бүтээгдэхүүний данс')}</span>
                </li>
                <li>
                  <span className="font-mono text-xs rounded bg-muted px-1.5 py-0.5 mr-2">
                    CF3
                  </span>
                  <span>{t('ББӨ данс')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
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
              {t('Гүйлгээ нэмэх')}
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
          title={t('Гүйлгээ импортлох')}
          additionContent={renderAdditionHelper}
          helperTriggerLabel={t('Гарын авлага харах')}
          helperDescription={t('Импортын гарын авлага болон талбарын тайлбар')}
        />
      </PageSubHeader>
      <TransactionTable />
    </AccountingLayout>
  );
};

import { IconCheck, IconPlus } from '@tabler/icons-react';
import {
  Button,
  cn,
  DatePicker,
  EnumCursorDirection,
  Input,
  ScrollArea,
  Select,
  Separator,
  Sheet,
  Spinner,
  Tooltip,
} from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import {
  CompaniesInline,
  CustomersInline,
  CustomerType,
  MembersInline,
  ProductsInline,
  SelectBranchesInlineCell,
  SelectCompany,
  SelectCustomer,
  SelectDepartmentsInlineCell,
  SelectMember,
} from 'ui-modules';
import { useDebounce } from 'use-debounce';
import { useTransactions } from '~/modules/transactions/hooks/useTransactions';
import { TrJournalEnum } from '~/modules/transactions/types/constants';
import { ITransaction } from '~/modules/transactions/types/Transaction';
import { useTransactionDetail } from '../../../hooks/useTransactionDetail';

interface SelectProductsProps {
  onSelect: (saleTrId: string, saleTr?: ITransaction) => void;
  children: React.ReactNode;
  saleTrId?: string;
}

const CUSTOMER_TYPE_LABELS = {
  [CustomerType.CUSTOMER]: 'Харилцагч',
  [CustomerType.COMPANY]: 'Байгууллага',
  [CustomerType.USER]: 'Ажилтан',
};

export const SelectSaleSheet = ({
  onSelect,
  children,
  saleTrId,
}: SelectProductsProps) => {
  const [open, setOpen] = useState(false);
  const [selectedTrId, setSelectedTrId] = useState<string>(saleTrId ?? '');
  const [selectedTr, setSelectedTr] = useState<ITransaction>();

  const sumbitSelect = () => {
    onSelect(selectedTrId, selectedTr);
    setOpen(false);
  };

  const handleSelect = (tr: ITransaction | undefined) => {
    setSelectedTrId(tr?._id || '');
    setSelectedTr(tr);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>{children}</Sheet.Trigger>
      <Sheet.View className="sm:max-w-5xl">
        <Sheet.Header>
          <div>
            <Sheet.Title>Гүйлгээ сонгох</Sheet.Title>
          </div>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="grid overflow-hidden grid-cols-2">
          <TransactionList
            selectedTrId={selectedTrId}
            setSelectedTr={handleSelect}
          ></TransactionList>
          <SelectedTrDetail
            selectedTrId={selectedTrId}
            setSelectedTr={handleSelect}
          ></SelectedTrDetail>
        </Sheet.Content>
        <Sheet.Footer className="sm:justify-between">
          <div className="flex gap-2 items-center">
            <Sheet.Close asChild>
              <Button variant="secondary" className="bg-border">
                Болих
              </Button>
            </Sheet.Close>
            <Button onClick={sumbitSelect}>Гүйлгээ сонгох</Button>
          </div>
        </Sheet.Footer>
      </Sheet.View>
    </Sheet>
  );
};

const TransactionList = ({
  selectedTrId,
  setSelectedTr,
}: {
  selectedTrId: string;
  setSelectedTr: (tr: ITransaction | undefined) => void;
}) => {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const [customerType, setCustomerType] = useState<string>('customer');
  const [customerId, setCustomerId] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const { transactions, handleFetchMore, totalCount } = useTransactions({
    variables: {
      journal: TrJournalEnum.INV_SALE,
      searchValue: debouncedSearch,
      customerType: customerType,
      customerId: customerId,
      startDate: startDate && new Date(startDate),
      endDate: endDate && new Date(endDate),
    },
  });

  const { ref: bottomRef } = useInView({
    onChange: (inView) =>
      inView && handleFetchMore({ direction: EnumCursorDirection.FORWARD }),
  });

  return (
    <div className="flex overflow-hidden flex-col border-r">
      <div className="p-4">
        <div className="flex gap-4 justify-between items-center">
          <div className="flex gap-3 items-center">
            <Select
              value={customerType}
              onValueChange={(value) => setCustomerType(value)}
            >
              <Select.Trigger>
                <Select.Value placeholder="Харилцагчийн төрөл сонгох" />
              </Select.Trigger>
              <Select.Content>
                {Object.values(CustomerType).map((type) => (
                  <Select.Item key={type} value={type}>
                    {CUSTOMER_TYPE_LABELS[type]}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
          {customerType === 'customer' && (
            <SelectCustomer
              mode="single"
              value={customerId || ''}
              onValueChange={(value) => {
                setCustomerId(value as string);
              }}
            />
          )}
          {customerType === 'company' && (
            <SelectCompany
              mode="single"
              value={customerId || ''}
              onValueChange={(value) => {
                setCustomerId(value as string);
              }}
            />
          )}
          {customerType === 'user' && (
            <SelectMember
              mode="single"
              value={customerId || ''}
              onValueChange={(value) => {
                setCustomerId(value as string);
              }}
            />
          )}
        </div>
        <div className="flex gap-4 justify-between items-center pt-2">
          <div className="flex flex-1 gap-6 items-center">
            <Input
              placeholder="Бараа хайх"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-1 gap-4 items-center">
            <DatePicker
              value={startDate}
              onChange={(date) => setStartDate(date as Date)}
              format="YYYY-MM-DD"
              className="h-8 flex w-full"
            />
          </div>
          <div className="flex flex-1 gap-4 items-center">
            <DatePicker
              value={endDate}
              onChange={(date) => setEndDate(date as Date)}
              format="YYYY-MM-DD"
              className="h-8 flex w-full"
            />
          </div>
        </div>
        <div className="mt-4 text-xs text-accent-foreground">
          {totalCount} үр дүн
        </div>
      </div>
      <Separator />
      <ScrollArea>
        <div className="flex flex-col gap-1 p-4">
          <Tooltip.Provider>
            {transactions?.map((tr) => {
              const isSelected = selectedTrId === tr._id;
              return (
                <Tooltip key={tr._id}>
                  <Tooltip.Trigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        'min-h-9 h-auto justify-start font-normal whitespace-normal max-w-full text-left',
                        isSelected && 'bg-primary/10 hover:bg-primary/10',
                      )}
                      onClick={() => setSelectedTr(tr)}
                    >
                      <div>{`${tr.date} - ${tr.number} - (${tr.sumCt})`}</div>
                      {isSelected ? (
                        <IconCheck className="ml-auto" />
                      ) : (
                        <IconPlus className="ml-auto" />
                      )}
                    </Button>
                  </Tooltip.Trigger>
                  <Tooltip.Content>
                    <span className="opacity-50">#</span> {tr.number}
                  </Tooltip.Content>
                </Tooltip>
              );
            })}

            {(transactions?.length ?? 0) < (totalCount ?? 0) && (
              <div className="flex gap-2 items-center px-2 h-8" ref={bottomRef}>
                <Spinner containerClassName="flex-none" />
                <span className="animate-pulse text-accent-foreground">
                  Нэмэлт гүйлгээ ачаалж байна...
                </span>
              </div>
            )}
          </Tooltip.Provider>
        </div>
      </ScrollArea>
    </div>
  );
};

const SelectedTrDetail = ({
  selectedTrId,
  setSelectedTr,
}: {
  selectedTrId?: string;
  setSelectedTr: (tr: ITransaction | undefined) => void;
}) => {
  const [trDetail, setTrDetail] = useState<ITransaction | undefined>();

  const { transaction, loading } = useTransactionDetail({
    variables: { _id: selectedTrId },
    skip: !selectedTrId,
  });

  useEffect(() => {
    if (!loading) {
      setTrDetail(transaction);
    }
  }, [transaction, loading]);

  if (!selectedTrId) {
    return <>Гүйлгээ сонгоогүй байна</>;
  }

  if (!trDetail || loading) {
    return <Spinner />;
  }

  return (
    <ScrollArea className="h-full">
      <Button
        variant="secondary"
        className="bg-border"
        onClick={() => setSelectedTr(undefined)}
      >
        Сонголт цэвэрлэх
      </Button>

      <div className="flex flex-col gap-1 p-4">
        <div className="px-3 mb-1 text-xs text-accent-foreground">
          Сонгосон:
        </div>
        <div className="px-3 mb-1 text-xs text-accent-foreground">
          Огноо: <span>{`${trDetail.date}`}</span>
        </div>
        <div className="px-3 mb-1 text-xs text-accent-foreground">
          Дугаар: <span>{`${trDetail.number}`}</span>
        </div>
        <div className="px-3 mb-1 text-xs text-accent-foreground">
          Харилцагчийн төрөл:{' '}
          <span>
            {CUSTOMER_TYPE_LABELS[trDetail.customerType as CustomerType] ||
              trDetail.customerType}
          </span>
        </div>

        {trDetail.customerType === 'company' && (
          <div className="px-3 mb-1 text-xs text-accent-foreground">
            Байгууллага:{' '}
            <span>
              <CompaniesInline companyIds={[trDetail.customerId || '']} />
            </span>
          </div>
        )}
        {trDetail.customerType === 'customer' && (
          <div className="px-3 mb-1 text-xs text-accent-foreground">
            Харилцагч:{' '}
            <span>
              <CustomersInline customerIds={[trDetail.customerId || '']} />
            </span>
          </div>
        )}
        {trDetail.customerType === 'user' && (
          <div className="px-3 mb-1 text-xs text-accent-foreground">
            Ажилтан:{' '}
            <span>
              <MembersInline memberIds={[trDetail.customerId || '']} />
            </span>
          </div>
        )}

        <div className="px-3 mb-1 text-xs text-accent-foreground">
          Салбар:{' '}
          <span>
            <SelectBranchesInlineCell branchIds={[trDetail.branchId || '']} />
          </span>
        </div>
        <div className="px-3 mb-1 text-xs text-accent-foreground">
          Хэлтэс:{' '}
          <span>
            <SelectDepartmentsInlineCell
              departmentIds={[trDetail.departmentId || '']}
            />
          </span>
        </div>

        {trDetail.hasVat && (
          <div className="px-3 mb-1 text-xs text-accent-foreground">
            НӨАТ: <span>{`${trDetail.hasVat}`}</span>
          </div>
        )}
        {trDetail.hasCtax && (
          <div className="px-3 mb-1 text-xs text-accent-foreground">
            НХАТ: <span>{`${trDetail.hasCtax}`}</span>
          </div>
        )}

        <ul>
          {trDetail.details.map((det) => (
            <li key={det._id}>
              <ProductsInline productIds={[det.productId || '']} />
              {` | ${det.count} | ${det.amount}`}
            </li>
          ))}
        </ul>
      </div>
    </ScrollArea>
  );
};

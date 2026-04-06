import {
  Button,
  Select,
  cn,
  EnumCursorDirection,
  Input,
  ScrollArea,
  Separator,
  Sheet,
  Spinner,
  Tooltip,
  DatePicker,
} from 'erxes-ui';
import { useEffect, useState } from 'react';
import { ITransaction } from '~/modules/transactions/types/Transaction';
import { useInView } from 'react-intersection-observer';
import { IconCheck, IconPlus } from '@tabler/icons-react';
import { useTransactions } from '~/modules/transactions/hooks/useTransactions';
import { useDebounce } from 'use-debounce';
import { TrJournalEnum } from '~/modules/transactions/types/constants';
import { useOneTrDetail } from '../../../hooks/useOneTrDetail';
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

interface SelectProductsProps {
  onSelect: (saleTrId: string, saleTr?: ITransaction) => void;
  children: React.ReactNode;
  saleTrId?: string;
}

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
            <Sheet.Title>Select Transaction</Sheet.Title>
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
                Cancel
              </Button>
            </Sheet.Close>
            <Button onClick={sumbitSelect}>Select Transaction</Button>
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
                <Select.Value placeholder="Select Customer Type" />
              </Select.Trigger>
              <Select.Content>
                {Object.values(CustomerType).map((type) => (
                  <Select.Item key={type} value={type}>
                    {type}
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
              placeholder="Search products"
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
          {totalCount} results
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
                  Loading more transactions...
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

  const { transaction, loading } = useOneTrDetail({
    variables: { _id: selectedTrId },
    skip: !selectedTrId,
  });

  useEffect(() => {
    if (!loading) {
      setTrDetail(transaction);
    }
  }, [transaction, loading]);

  if (!selectedTrId) {
    return <>Empty select transaction</>;
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
        Clear Selected
      </Button>

      <div className="flex flex-col gap-1 p-4">
        <div className="px-3 mb-1 text-xs text-accent-foreground">
          Selected:
        </div>
        <div className="px-3 mb-1 text-xs text-accent-foreground">
          Date: <span>{`${trDetail.date}`}</span>
        </div>
        <div className="px-3 mb-1 text-xs text-accent-foreground">
          Number: <span>{`${trDetail.number}`}</span>
        </div>
        <div className="px-3 mb-1 text-xs text-accent-foreground">
          CustomerType: <span>{`${trDetail.customerType}`}</span>
        </div>

        {trDetail.customerType === 'company' && (
          <div className="px-3 mb-1 text-xs text-accent-foreground">
            Company:{' '}
            <span>
              <CompaniesInline companyIds={[trDetail.customerId || '']} />
            </span>
          </div>
        )}
        {trDetail.customerType === 'customer' && (
          <div className="px-3 mb-1 text-xs text-accent-foreground">
            Company:{' '}
            <span>
              <CustomersInline customerIds={[trDetail.customerId || '']} />
            </span>
          </div>
        )}
        {trDetail.customerType === 'user' && (
          <div className="px-3 mb-1 text-xs text-accent-foreground">
            Member:{' '}
            <span>
              <MembersInline memberIds={[trDetail.customerId || '']} />
            </span>
          </div>
        )}

        <div className="px-3 mb-1 text-xs text-accent-foreground">
          Branch:{' '}
          <span>
            <SelectBranchesInlineCell branchIds={[trDetail.branchId || '']} />
          </span>
        </div>
        <div className="px-3 mb-1 text-xs text-accent-foreground">
          Department:{' '}
          <span>
            <SelectDepartmentsInlineCell
              departmentIds={[trDetail.departmentId || '']}
            />
          </span>
        </div>

        {trDetail.hasVat && (
          <div className="px-3 mb-1 text-xs text-accent-foreground">
            Vat: <span>{`${trDetail.hasVat}`}</span>
          </div>
        )}
        {trDetail.hasCtax && (
          <div className="px-3 mb-1 text-xs text-accent-foreground">
            Ctax: <span>{`${trDetail.hasCtax}`}</span>
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

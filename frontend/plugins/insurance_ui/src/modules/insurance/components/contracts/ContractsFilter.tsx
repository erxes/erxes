import {
  IconCalendar,
  IconCar,
  IconFileDescription,
  IconHash,
  IconIdBadge2,
  IconSearch,
  IconToggleRightFilled,
} from '@tabler/icons-react';
import { Combobox, Command, Filter, useMultiQueryState } from 'erxes-ui';
import { useInsuranceTypes } from '~/modules/insurance/hooks';

const PAYMENT_STATUS_OPTIONS = [
  { label: 'Төлсөн', value: 'paid' },
  { label: 'Хүлээгдэж буй', value: 'pending' },
  { label: 'Цуцлагдсан', value: 'cancelled' },
];

const PaymentStatusFilterView = () => {
  const [value, setValue] = useMultiQueryState<string>('paymentStatus');
  return (
    <div className="p-2 space-y-1">
      {PAYMENT_STATUS_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setValue(value === opt.value ? null : opt.value)}
          className={`w-full text-left px-3 py-1.5 rounded text-sm hover:bg-accent ${
            value === opt.value ? 'bg-accent font-medium' : ''
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

const InsuranceTypeFilterView = () => {
  const { insuranceTypes } = useInsuranceTypes();
  const [value, setValue] = useMultiQueryState<string>('insuranceTypeId');
  return (
    <div className="p-2 space-y-1 max-h-48 overflow-y-auto">
      {(insuranceTypes || []).map((type: any) => (
        <button
          key={type.id}
          onClick={() => setValue(value === type.id ? null : type.id)}
          className={`w-full text-left px-3 py-1.5 rounded text-sm hover:bg-accent ${
            value === type.id ? 'bg-accent font-medium' : ''
          }`}
        >
          {type.name}
        </button>
      ))}
    </div>
  );
};

const ContractsFilterPopover = () => {
  const [queries] = useMultiQueryState<{
    searchValue: string;
    contractNumber: string;
    customerRegistration: string;
    plateNumber: string;
    paymentStatus: string;
    insuranceTypeId: string;
    startDate: string;
    endDate: string;
  }>([
    'searchValue',
    'contractNumber',
    'customerRegistration',
    'plateNumber',
    'paymentStatus',
    'insuranceTypeId',
    'startDate',
    'endDate',
  ]);

  const hasFilters = Object.values(queries || {}).some((v) => v !== null);

  return (
    <>
      <Filter.Popover>
        <Filter.Trigger isFiltered={hasFilters} />
        <Combobox.Content>
          <Filter.View>
            <Command>
              <Filter.CommandInput
                placeholder="Filter"
                variant="secondary"
                className="bg-background"
              />
              <Command.List className="p-1">
                <Filter.Item value="searchValue" inDialog>
                  <IconSearch />
                  Хайх
                </Filter.Item>
                <Filter.Item value="contractNumber" inDialog>
                  <IconFileDescription />
                  Гэрээний дугаар
                </Filter.Item>
                <Filter.Item value="customerRegistration" inDialog>
                  <IconIdBadge2 />
                  Регистрийн дугаар
                </Filter.Item>
                <Filter.Item value="plateNumber" inDialog>
                  <IconCar />
                  Улсын дугаар
                </Filter.Item>
                <Command.Separator className="my-1" />
                <Filter.Item value="paymentStatus">
                  <IconToggleRightFilled />
                  Төлбөрийн төлөв
                </Filter.Item>
                <Filter.Item value="insuranceTypeId">
                  <IconHash />
                  Даатгалын төрөл
                </Filter.Item>
                <Command.Separator className="my-1" />
                <Filter.Item value="startDate" inDialog>
                  <IconCalendar />
                  Эхлэх огноо
                </Filter.Item>
                <Filter.Item value="endDate" inDialog>
                  <IconCalendar />
                  Дуусах огноо
                </Filter.Item>
              </Command.List>
            </Command>
          </Filter.View>

          <Filter.View filterKey="paymentStatus">
            <PaymentStatusFilterView />
          </Filter.View>

          <Filter.View filterKey="insuranceTypeId">
            <InsuranceTypeFilterView />
          </Filter.View>
        </Combobox.Content>
      </Filter.Popover>

      <Filter.Dialog>
        <Filter.View filterKey="searchValue" inDialog>
          <Filter.DialogStringView filterKey="searchValue" />
        </Filter.View>
        <Filter.View filterKey="contractNumber" inDialog>
          <Filter.DialogStringView filterKey="contractNumber" />
        </Filter.View>
        <Filter.View filterKey="customerRegistration" inDialog>
          <Filter.DialogStringView filterKey="customerRegistration" />
        </Filter.View>
        <Filter.View filterKey="plateNumber" inDialog>
          <Filter.DialogStringView filterKey="plateNumber" />
        </Filter.View>
        <Filter.View filterKey="startDate" inDialog>
          <Filter.DialogDateView filterKey="startDate" />
        </Filter.View>
        <Filter.View filterKey="endDate" inDialog>
          <Filter.DialogDateView filterKey="endDate" />
        </Filter.View>
      </Filter.Dialog>
    </>
  );
};

export const ContractsFilter = () => {
  const [queries] = useMultiQueryState<{
    searchValue: string;
    contractNumber: string;
    customerRegistration: string;
    plateNumber: string;
    paymentStatus: string;
    insuranceTypeId: string;
    startDate: string;
    endDate: string;
  }>([
    'searchValue',
    'contractNumber',
    'customerRegistration',
    'plateNumber',
    'paymentStatus',
    'insuranceTypeId',
    'startDate',
    'endDate',
  ]);

  const {
    searchValue,
    contractNumber,
    customerRegistration,
    plateNumber,
    startDate,
    endDate,
  } = queries || {};
  const { insuranceTypes } = useInsuranceTypes();
  const selectedTypeName = insuranceTypes?.find(
    (t: any) => t.id === queries?.insuranceTypeId,
  )?.name;

  return (
    <Filter id="contracts-filter" sessionKey="contracts-cursor">
      <Filter.Bar>
        <ContractsFilterPopover />

        {searchValue && (
          <Filter.BarItem queryKey="searchValue">
            <Filter.BarName>
              <IconSearch />
              Хайх
            </Filter.BarName>
            <Filter.BarButton filterKey="searchValue" inDialog>
              {searchValue}
            </Filter.BarButton>
          </Filter.BarItem>
        )}
        {contractNumber && (
          <Filter.BarItem queryKey="contractNumber">
            <Filter.BarName>
              <IconFileDescription />
              Гэрээний дугаар
            </Filter.BarName>
            <Filter.BarButton filterKey="contractNumber" inDialog>
              {contractNumber}
            </Filter.BarButton>
          </Filter.BarItem>
        )}
        {customerRegistration && (
          <Filter.BarItem queryKey="customerRegistration">
            <Filter.BarName>
              <IconIdBadge2 />
              Регистр
            </Filter.BarName>
            <Filter.BarButton filterKey="customerRegistration" inDialog>
              {customerRegistration}
            </Filter.BarButton>
          </Filter.BarItem>
        )}
        {plateNumber && (
          <Filter.BarItem queryKey="plateNumber">
            <Filter.BarName>
              <IconCar />
              Улсын дугаар
            </Filter.BarName>
            <Filter.BarButton filterKey="plateNumber" inDialog>
              {plateNumber}
            </Filter.BarButton>
          </Filter.BarItem>
        )}
        <Filter.BarItem queryKey="paymentStatus">
          <Filter.BarName>
            <IconToggleRightFilled />
            Төлбөрийн төлөв
          </Filter.BarName>
          <Filter.BarButton filterKey="paymentStatus">
            {
              PAYMENT_STATUS_OPTIONS.find(
                (o) => o.value === queries?.paymentStatus,
              )?.label
            }
          </Filter.BarButton>
        </Filter.BarItem>
        <Filter.BarItem queryKey="insuranceTypeId">
          <Filter.BarName>
            <IconHash />
            Даатгалын төрөл
          </Filter.BarName>
          <Filter.BarButton filterKey="insuranceTypeId">
            {selectedTypeName}
          </Filter.BarButton>
        </Filter.BarItem>
        {startDate && (
          <Filter.BarItem queryKey="startDate">
            <Filter.BarName>
              <IconCalendar />
              Эхлэх огноо
            </Filter.BarName>
            <Filter.Date filterKey="startDate" />
          </Filter.BarItem>
        )}
        {endDate && (
          <Filter.BarItem queryKey="endDate">
            <Filter.BarName>
              <IconCalendar />
              Дуусах огноо
            </Filter.BarName>
            <Filter.Date filterKey="endDate" />
          </Filter.BarItem>
        )}
      </Filter.Bar>
    </Filter>
  );
};

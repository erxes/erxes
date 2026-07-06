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
import { useTranslation } from 'react-i18next';
import { useInsuranceTypes } from '~/modules/insurance/hooks';

const PAYMENT_STATUS_OPTIONS = [
  { label: 'paid-label', value: 'paid' },
  { label: 'pending-label', value: 'pending' },
  { label: 'cancelled-label', value: 'cancelled' },
];

const PaymentStatusFilterView = () => {
  const { t } = useTranslation('insurance');
  const [queries, setQueries] = useMultiQueryState<{ paymentStatus: string }>([
    'paymentStatus',
  ]);
  const value = queries?.paymentStatus;
  const setValue = (newValue: string | null) => {
    setQueries({ paymentStatus: newValue });
  };
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
          {t(opt.label)}
        </button>
      ))}
    </div>
  );
};

const InsuranceTypeFilterView = () => {
  const { insuranceTypes } = useInsuranceTypes();
  const [queries, setQueries] = useMultiQueryState<{ insuranceTypeId: string }>(
    ['insuranceTypeId'],
  );
  const value = queries?.insuranceTypeId;
  const setValue = (newValue: string | null) => {
    setQueries({ insuranceTypeId: newValue });
  };
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
  const { t } = useTranslation('insurance');
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
                placeholder={t('filter')}
                variant="secondary"
                className="bg-background"
              />
              <Command.List className="p-1">
                <Filter.Item value="searchValue" inDialog>
                  <IconSearch />
                  {t('search')}
                </Filter.Item>
                <Filter.Item value="contractNumber" inDialog>
                  <IconFileDescription />
                  {t('contract-number')}
                </Filter.Item>
                <Filter.Item value="customerRegistration" inDialog>
                  <IconIdBadge2 />
                  {t('registration-number')}
                </Filter.Item>
                <Filter.Item value="plateNumber" inDialog>
                  <IconCar />
                  {t('plate-number')}
                </Filter.Item>
                <Command.Separator className="my-1" />
                <Filter.Item value="paymentStatus">
                  <IconToggleRightFilled />
                  {t('payment-status')}
                </Filter.Item>
                <Filter.Item value="insuranceTypeId">
                  <IconHash />
                  {t('insurance-type')}
                </Filter.Item>
                <Command.Separator className="my-1" />
                <Filter.Item value="startDate" inDialog>
                  <IconCalendar />
                  {t('start-date')}
                </Filter.Item>
                <Filter.Item value="endDate" inDialog>
                  <IconCalendar />
                  {t('end-date')}
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
  const { t } = useTranslation('insurance');
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
              {t('search')}
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
              {t('contract-number')}
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
              {t('registration')}
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
              {t('plate-number')}
            </Filter.BarName>
            <Filter.BarButton filterKey="plateNumber" inDialog>
              {plateNumber}
            </Filter.BarButton>
          </Filter.BarItem>
        )}
        <Filter.BarItem queryKey="paymentStatus">
          <Filter.BarName>
            <IconToggleRightFilled />
            {t('payment-status')}
          </Filter.BarName>
          <Filter.BarButton filterKey="paymentStatus">
            {(() => {
              const opt = PAYMENT_STATUS_OPTIONS.find(
                (o) => o.value === queries?.paymentStatus,
              );
              return opt ? t(opt.label) : undefined;
            })()}
          </Filter.BarButton>
        </Filter.BarItem>
        <Filter.BarItem queryKey="insuranceTypeId">
          <Filter.BarName>
            <IconHash />
            {t('insurance-type')}
          </Filter.BarName>
          <Filter.BarButton filterKey="insuranceTypeId">
            {selectedTypeName}
          </Filter.BarButton>
        </Filter.BarItem>
        {startDate && (
          <Filter.BarItem queryKey="startDate">
            <Filter.BarName>
              <IconCalendar />
              {t('start-date')}
            </Filter.BarName>
            <Filter.Date filterKey="startDate" />
          </Filter.BarItem>
        )}
        {endDate && (
          <Filter.BarItem queryKey="endDate">
            <Filter.BarName>
              <IconCalendar />
              {t('end-date')}
            </Filter.BarName>
            <Filter.Date filterKey="endDate" />
          </Filter.BarItem>
        )}
      </Filter.Bar>
    </Filter>
  );
};

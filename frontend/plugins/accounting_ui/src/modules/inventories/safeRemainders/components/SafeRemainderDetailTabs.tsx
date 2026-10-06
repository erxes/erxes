import { useTranslation } from 'react-i18next';
import { ColumnDef } from '@tanstack/react-table';
import {
  RecordTable,
  RecordTableHotkeyProvider,
  Tabs,
  ToggleGroup,
  useSetHotkeyScope,
} from 'erxes-ui';
import { AccountingHotkeyScope } from '@/types/AccountingHotkeyScope';
import { ISafeRemainderItem } from '../types/SafeRemainder';
import { CENSUS_TABS } from '../types/constants';
import {
  getSafeRemainderTransactionTypes,
  SAFE_REMAINDER_TRANSACTION_TYPES,
} from '../utils/safeRemainderTransactions';
import { EditSafeRemainder } from './SafeRemainderEditForm';
import { SafeRemDetailCommandbar } from './SafeRemainderDetailCommandbar';
import { safeRemDetailColumnsCost } from './SafeRemainderDetailColsCost';
import { safeRemDetailColumnsIncome } from './SafeRemainderDetailColsIncome';
import { safeRemDetailColumnsOut } from './SafeRemainderDetailColsOut';
import { safeRemDetailColumnsSale } from './SafeRemainderDetailColsSale';
import { safeRemDetailTableColumns } from './SafeRemainderDetailColumns';

interface ISafeRemainderTableTab {
  value: string;
  columns: ColumnDef<ISafeRemainderItem>[];
  columnLength: number;
  tableId: string;
  showColumnSelector?: boolean;
  filter: (item: ISafeRemainderItem) => boolean;
}

const TABLE_TABS: ISafeRemainderTableTab[] = [
  {
    value: CENSUS_TABS.CENSUS.value,
    columns: safeRemDetailTableColumns,
    columnLength: 4,
    tableId: 'accounting_safe_remainder_census_record_table_v2',
    showColumnSelector: true,
    filter: () => true,
  },
  {
    value: CENSUS_TABS.INCOME.value,
    columns: safeRemDetailColumnsIncome,
    columnLength: 4,
    tableId: 'accounting_safe_remainder_income_record_table_v2',
    showColumnSelector: true,
    filter: (item) =>
      getSafeRemainderTransactionTypes(item).includes(
        SAFE_REMAINDER_TRANSACTION_TYPES.INCOME,
      ),
  },
  {
    value: CENSUS_TABS.OUT.value,
    columns: safeRemDetailColumnsOut,
    columnLength: 4,
    tableId: 'accounting_safe_remainder_out_record_table_v2',
    showColumnSelector: true,
    filter: (item) =>
      getSafeRemainderTransactionTypes(item).includes(
        SAFE_REMAINDER_TRANSACTION_TYPES.OUT,
      ),
  },
  {
    value: CENSUS_TABS.SALE.value,
    columns: safeRemDetailColumnsSale,
    columnLength: 6,
    tableId: 'accounting_safe_remainder_sale_record_table_v2',
    showColumnSelector: true,
    filter: (item) =>
      getSafeRemainderTransactionTypes(item).includes(
        SAFE_REMAINDER_TRANSACTION_TYPES.SALE,
      ),
  },
  {
    value: CENSUS_TABS.COST_INCREASE.value,
    columns: safeRemDetailColumnsCost,
    columnLength: 1,
    tableId: 'accounting_safe_remainder_cost_increase_record_table_v2',
    showColumnSelector: true,
    filter: (item) =>
      getSafeRemainderTransactionTypes(item).includes(
        SAFE_REMAINDER_TRANSACTION_TYPES.COST_INCREASE,
      ),
  },
  {
    value: CENSUS_TABS.COST_DECREASE.value,
    columns: safeRemDetailColumnsCost,
    columnLength: 1,
    tableId: 'accounting_safe_remainder_cost_decrease_record_table_v2',
    showColumnSelector: true,
    filter: (item) =>
      getSafeRemainderTransactionTypes(item).includes(
        SAFE_REMAINDER_TRANSACTION_TYPES.COST_DECREASE,
      ),
  },
];

interface ISafeRemainderDetailTabsProps {
  activeTab: string;
  items: ISafeRemainderItem[];
  loading: boolean;
  totalCount: number;
  onActiveTabChange: (value: string) => void;
  onFetchMore: () => void;
}

export const SafeRemainderDetailTabs = ({
  activeTab,
  items,
  loading,
  totalCount,
  onActiveTabChange,
  onFetchMore,
}: ISafeRemainderDetailTabsProps) => {
  const { t } = useTranslation('accounting');

  const setHotkeyScope = useSetHotkeyScope();

  return (
    <Tabs
      className="col-span-2 flex flex-1 flex-col min-h-0"
      value={activeTab}
      onValueChange={onActiveTabChange}
    >
      <div className="flex items-center gap-3 px-3 pt-3">
        <ToggleGroup
          type="single"
          value={activeTab}
          onValueChange={(value) => value && onActiveTabChange(value)}
          variant="outline"
          className="h-8"
        >
          {Object.values(CENSUS_TABS).map((field) => (
            <ToggleGroup.Item
              key={field.value}
              value={field.value}
              className="capitalize"
            >
              {t(field.label)}
            </ToggleGroup.Item>
          ))}
        </ToggleGroup>
      </div>

      {TABLE_TABS.map((tab) => {
        const tabItems = items.filter(tab.filter);

        return (
          <Tabs.Content
            key={tab.value}
            value={tab.value}
            className="mt-6 flex-1 min-h-0 flex flex-col data-[state=inactive]:hidden"
          >
            <RecordTableHotkeyProvider
              columnLength={tab.columnLength}
              rowLength={tabItems.length}
              scope={AccountingHotkeyScope.SafeRemainderPage}
            >
              <RecordTable.Provider
                columns={tab.columns}
                data={tabItems}
                stickyColumns={[]}
                tableId={tab.tableId}
                className="m-3"
                onClickCapture={() =>
                  setHotkeyScope(AccountingHotkeyScope.SafeRemainderPage)
                }
              >
                <RecordTable.Scroll>
                  <RecordTable>
                    <RecordTable.Header
                      showColumnSelector={tab.showColumnSelector}
                    />
                    <RecordTable.Body>
                      <RecordTable.RowList />
                      {!loading && totalCount > items.length && (
                        <RecordTable.RowSkeleton
                          rows={4}
                          handleInView={onFetchMore}
                        />
                      )}
                    </RecordTable.Body>
                  </RecordTable>
                  <SafeRemDetailCommandbar />
                </RecordTable.Scroll>
              </RecordTable.Provider>
            </RecordTableHotkeyProvider>
          </Tabs.Content>
        );
      })}

      <Tabs.Content
        value={CENSUS_TABS.CONFIG.value}
        className="mt-6 flex-1 min-h-0 overflow-hidden"
      >
        <EditSafeRemainder />
      </Tabs.Content>
    </Tabs>
  );
};

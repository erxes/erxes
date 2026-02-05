import {
  IconCalendarPlus,
  IconBuilding,
  IconSearch,
  IconFileText,
  IconReceipt,
  IconCreditCard,
} from '@tabler/icons-react';

import {
  Combobox,
  Command,
  Filter,
  useFilterQueryState,
  useMultiQueryState,
} from 'erxes-ui';

import { useByDateLeadSessionKey } from '~/modules/ebarimt/put-response/put-responses-by-date/hooks/useByDateLeadSessionKey';
import { ByDateTotalCount } from '~/modules/ebarimt/put-response/put-responses-by-date/components/ByDateTotalCount';
import { ByDateHotKeyScope } from '~/modules/ebarimt/put-response/put-responses-by-date/types/path/ByDateHotKeyScope';
import { SelectContentType } from './selects/SelectContentType';
import { SelectStatus } from './selects/SelectStatus';
import { SelectSalesBoard } from './selects/SelectBoard';
import { SelectOnLast } from './selects/SelectOnLast';
import { SelectBillType } from './selects/SelectBillType';
import { SelectBillIdRule } from './selects/SelectBillIdRule';
import { SelectPipeline } from './selects/SelectPipeline';
import { SelectStage } from './selects/SelectStage';

const ByDateFilterPopover = () => {
  const [boardId] = useFilterQueryState<string>('boardId');
  const [pipelineId] = useFilterQueryState<string>('pipelineId');
  const [queries] = useMultiQueryState<{
    billId: string[];
    contentType: string;
    dealName: string;
    boardId: string;
    pipelineId: string;
    stageId: string;
    orderNumber: string;
    contractNumber: string;
    transactionNumber: string;
    status: string;
    billType: string;
    billIdRule: string;
    isLast: string;
    dateRange: string;
  }>([
    'billId',
    'contentType',
    'dealName',
    'boardId',
    'pipelineId',
    'stageId',
    'orderNumber',
    'contractNumber',
    'transactionNumber',
    'status',
    'billType',
    'billIdRule',
    'isLast',
    'dateRange',
  ]);

  const hasFilters = Object.values(queries || {}).some(
    (value) => value !== null,
  );

  const contentType = queries.contentType;
  const showDealFields = contentType === 'deal';
  const showPosFields = contentType === 'pos';
  const showLoanTransactionFields = contentType === 'loan-transaction';

  return (
    <>
      <Filter.Popover scope={ByDateHotKeyScope.ByDatePage}>
        <Filter.Trigger isFiltered={hasFilters} />
        <Combobox.Content>
          <Filter.View>
            <Command>
              <Filter.CommandInput
                placeholder="Filter"
                variant="secondary"
                className="bg-background"
              />
              <Command.List className="p-1 max-h-none">
                <Filter.Item value="billId" inDialog>
                  <IconSearch />
                  Bill Id
                </Filter.Item>
                <SelectContentType.FilterItem />

                {showDealFields && (
                  <>
                    <Filter.Item value="dealName" inDialog>
                      <IconBuilding />
                      Deal Name
                    </Filter.Item>
                    <SelectSalesBoard.FilterItem />
                    <SelectPipeline.FilterItem />
                    <SelectStage.FilterItem />
                  </>
                )}

                {showPosFields && (
                  <Filter.Item value="orderNumber" inDialog>
                    <IconReceipt />
                    Order Number
                  </Filter.Item>
                )}

                {showLoanTransactionFields && (
                  <>
                    <Filter.Item value="contractNumber" inDialog>
                      <IconFileText />
                      Contract Number
                    </Filter.Item>
                    <Filter.Item value="transactionNumber" inDialog>
                      <IconCreditCard />
                      Transaction Number
                    </Filter.Item>
                  </>
                )}

                <SelectStatus.FilterItem />
                <Command.Separator className="my-1" />
                <SelectBillType.FilterItem />
                <SelectBillIdRule.FilterItem />
                <SelectOnLast.FilterItem />

                <Command.Separator className="my-1" />
                <Filter.Item value="dateRange">
                  <IconCalendarPlus />
                  Date Range
                </Filter.Item>
              </Command.List>
            </Command>
          </Filter.View>
          <SelectContentType.FilterView />

          {showDealFields && (
            <>
              <Filter.View filterKey="dealName">
                <Filter.DialogStringView filterKey="dealName" />
              </Filter.View>
              <SelectSalesBoard.FilterView />
              <SelectPipeline.FilterView boardId={boardId || undefined} />
              <SelectStage.FilterView pipelineId={pipelineId || undefined} />
            </>
          )}

          {showPosFields && (
            <Filter.View filterKey="orderNumber">
              <Filter.DialogStringView filterKey="orderNumber" />
            </Filter.View>
          )}

          {showLoanTransactionFields && (
            <>
              <Filter.View filterKey="contractNumber">
                <Filter.DialogStringView filterKey="contractNumber" />
              </Filter.View>
              <Filter.View filterKey="transactionNumber">
                <Filter.DialogStringView filterKey="transactionNumber" />
              </Filter.View>
            </>
          )}

          <SelectStatus.FilterView />
          <SelectBillType.FilterView />
          <SelectBillIdRule.FilterView />
          <SelectOnLast.FilterView />
          <Filter.View filterKey="dateRange">
            <Filter.DateView filterKey="dateRange" />
          </Filter.View>
        </Combobox.Content>
      </Filter.Popover>
      <Filter.Dialog>
        <Filter.View filterKey="billId" inDialog>
          <Filter.DialogStringView filterKey="billId" />
        </Filter.View>

        <Filter.View filterKey="dealName" inDialog>
          <Filter.DialogStringView filterKey="dealName" />
        </Filter.View>

        {showPosFields && (
          <Filter.View filterKey="orderNumber" inDialog>
            <Filter.DialogStringView filterKey="orderNumber" />
          </Filter.View>
        )}

        {showLoanTransactionFields && (
          <>
            <Filter.View filterKey="contractNumber" inDialog>
              <Filter.DialogStringView filterKey="contractNumber" />
            </Filter.View>
            <Filter.View filterKey="transactionNumber" inDialog>
              <Filter.DialogStringView filterKey="transactionNumber" />
            </Filter.View>
          </>
        )}

        <Filter.View filterKey="status" inDialog>
          <SelectStatus.FilterView />
        </Filter.View>
        <Filter.View filterKey="billType" inDialog>
          <SelectBillType.FilterView />
        </Filter.View>
        <Filter.View filterKey="billIdRule" inDialog>
          <SelectBillIdRule.FilterView />
        </Filter.View>
        <Filter.View filterKey="isLast" inDialog>
          <SelectOnLast.FilterView />
        </Filter.View>
        <Filter.View filterKey="dateRange" inDialog>
          <Filter.DialogDateView filterKey="dateRange" />
        </Filter.View>
      </Filter.Dialog>
    </>
  );
};

export const ByDateFilter = () => {
  const [billId] = useFilterQueryState<string>('billId');
  const [boardId] = useFilterQueryState<string>('boardId');
  const [pipelineId] = useFilterQueryState<string>('pipelineId');
  const [dealName] = useFilterQueryState<string>('dealName');
  const [orderNumber] = useFilterQueryState<string>('orderNumber');
  const [contractNumber] = useFilterQueryState<string>('contractNumber');
  const [transactionNumber] = useFilterQueryState<string>('transactionNumber');
  const [contentType] = useFilterQueryState<string>('contentType');
  const { sessionKey } = useByDateLeadSessionKey();

  const showDealFields = contentType === 'deal';
  const showPosFields = contentType === 'pos';
  const showLoanTransactionFields = contentType === 'loan-transaction';

  return (
    <Filter id="by-date-filter" sessionKey={sessionKey}>
      <Filter.Bar>
        <ByDateFilterPopover />
        <Filter.BarItem queryKey="billId">
          <Filter.BarName>
            <IconSearch />
            billId
          </Filter.BarName>
          <Filter.BarButton filterKey="billId" inDialog>
            {billId}
          </Filter.BarButton>
        </Filter.BarItem>

        {showDealFields && (
          <>
            <Filter.BarItem queryKey="dealName">
              <Filter.BarName>
                <IconBuilding />
                Deal Name
              </Filter.BarName>
              <Filter.BarButton filterKey="dealName" inDialog>
                {dealName}
              </Filter.BarButton>
            </Filter.BarItem>
            <SelectSalesBoard.FilterBar />
            <SelectPipeline.FilterBar boardId={boardId || undefined} />
            <SelectStage.FilterBar pipelineId={pipelineId || undefined} />
          </>
        )}

        {showPosFields && (
          <Filter.BarItem queryKey="orderNumber">
            <Filter.BarName>
              <IconReceipt />
              Order Number
            </Filter.BarName>
            <Filter.BarButton filterKey="orderNumber" inDialog>
              {orderNumber}
            </Filter.BarButton>
          </Filter.BarItem>
        )}

        {showLoanTransactionFields && (
          <>
            <Filter.BarItem queryKey="contractNumber">
              <Filter.BarName>
                <IconFileText />
                Contract Number
              </Filter.BarName>
              <Filter.BarButton filterKey="contractNumber" inDialog>
                {contractNumber}
              </Filter.BarButton>
            </Filter.BarItem>
            <Filter.BarItem queryKey="transactionNumber">
              <Filter.BarName>
                <IconCreditCard />
                Transaction Number
              </Filter.BarName>
              <Filter.BarButton filterKey="transactionNumber" inDialog>
                {transactionNumber}
              </Filter.BarButton>
            </Filter.BarItem>
          </>
        )}

        <Filter.BarItem queryKey="dateRange">
          <Filter.BarName>
            <IconCalendarPlus />
            Date Range
          </Filter.BarName>
          <Filter.Date filterKey="dateRange" />
        </Filter.BarItem>
        <SelectContentType.FilterBar />
        <SelectStatus.FilterBar />
        <SelectBillType.FilterBar />
        <SelectBillIdRule.FilterBar />
        <SelectOnLast.FilterBar />
        <ByDateTotalCount />
      </Filter.Bar>
    </Filter>
  );
};

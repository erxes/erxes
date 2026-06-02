import {
  IconProgressCheck,
  IconSearch,
  IconWallet,
} from '@tabler/icons-react';
import {
  Combobox,
  Command,
  Filter,
  PageSubHeader,
  Popover,
  useMultiQueryState,
} from 'erxes-ui';
import { INVOICES_CURSOR_SESSION_KEY } from '~/modules/payment/hooks/use-invoices';
import { PAYMENT_KINDS } from '~/modules/payment/constants';
import { InvoiceKindFilter } from './InvoiceKindFilter';
import { InvoiceStatusFilter } from './InvoiceStatusFilter';

export const InvoiceFilterBar = () => {
  const [queries] = useMultiQueryState<{ status?: string; kind?: string }>([
    'status',
    'kind',
  ]);
  const { status, kind } = queries;

  const kindLabel = kind ? PAYMENT_KINDS[kind as keyof typeof PAYMENT_KINDS]?.name ?? kind : undefined;

  return (
    <Filter id="invoices" sessionKey={INVOICES_CURSOR_SESSION_KEY}>
      <PageSubHeader>
        <Filter.Bar>
          <Filter.Popover scope="invoices-page">
            <Filter.Trigger isFiltered={!!status || !!kind} />
            <Combobox.Content>
              <Filter.View>
                <Command>
                  <Filter.CommandInput placeholder="Filter invoices..." />
                  <Command.List className="p-1">
                    <Filter.SearchValueTrigger />
                    <Filter.Item value="status" active={!!status}>
                      <IconProgressCheck />
                      Status
                    </Filter.Item>
                    <Filter.Item value="kind" active={!!kind}>
                      <IconWallet />
                      Payment kind
                    </Filter.Item>
                  </Command.List>
                </Command>
              </Filter.View>
              <Filter.View filterKey="status">
                <InvoiceStatusFilter />
              </Filter.View>
              <Filter.View filterKey="kind">
                <InvoiceKindFilter />
              </Filter.View>
            </Combobox.Content>
          </Filter.Popover>

          <Filter.Dialog>
            <Filter.View filterKey="searchValue" inDialog>
              <Filter.DialogStringView filterKey="searchValue" label="Search" />
            </Filter.View>
          </Filter.Dialog>

          <Filter.SearchValueBarItem />

          <Filter.BarItem queryKey="status">
            <Filter.BarName>
              <IconProgressCheck />
              Status
            </Filter.BarName>
            <Popover>
              <Popover.Trigger asChild>
                <Filter.BarButton>{status}</Filter.BarButton>
              </Popover.Trigger>
              <Popover.Content className="p-0">
                <InvoiceStatusFilter />
              </Popover.Content>
            </Popover>
          </Filter.BarItem>

          <Filter.BarItem queryKey="kind">
            <Filter.BarName>
              <IconWallet />
              Kind
            </Filter.BarName>
            <Popover>
              <Popover.Trigger asChild>
                <Filter.BarButton>{kindLabel}</Filter.BarButton>
              </Popover.Trigger>
              <Popover.Content className="p-0">
                <InvoiceKindFilter />
              </Popover.Content>
            </Popover>
          </Filter.BarItem>
        </Filter.Bar>
      </PageSubHeader>
    </Filter>
  );
};

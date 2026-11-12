import type { CustomerState } from '@erxes/core-contract';
import { IconChartFunnel, IconLayoutKanban, IconPlus, IconTable } from '@tabler/icons-react';
import { Button, cn, Kbd, useQueryState } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSidePanel } from '~/modules/side-panel/useSidePanel';
import { ContactsBreadcrumb } from '../components/ContactsBreadcrumb';
import { ContactsPageHeader } from '../components/ContactsPageHeader';
import { ExportButton, ImportButton } from '~/modules/transfer/TransferButtons';
import { useCustomersFilters } from './useCustomers';

/** Export with the list's quick filters (the advanced filter and search come from the address). */
const CustomersExportButton = ({ state }: { state: CustomerState }) => {
  const filters = useCustomersFilters(state);

  return <ExportButton recordType={state} query={{ tagIds: filters.tagIds?.split(','), ownerId: filters.ownerId }} />;
};

/** `C` runs `action` unless typing somewhere or a dialog is open (old page hotkey). */
export const useCreateHotkey = (action: () => void) => {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;

      if (
        event.key.toLowerCase() === 'c' &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        !event.repeat &&
        !target?.closest('input, textarea, select, [contenteditable="true"], [role="dialog"], [role="menu"], [role="listbox"]') &&
        !document.querySelector('[role="dialog"][data-state="open"]')
      ) {
        event.preventDefault();
        action();
      }
    };

    window.addEventListener('keydown', onKey);

    return () => window.removeEventListener('keydown', onKey);
  }, [action]);
};

/**
 * Opens a new customer (or lead) in the side panel as a draft; it is created
 * on Save.
 */
export const CustomerCreateButton = ({ state }: { state: CustomerState }) => {
  const { t } = useTranslation('contact');
  const { openNewRecord } = useSidePanel();
  const isLead = state === 'lead';

  const create = () => openNewRecord('core:customer', { state });

  useCreateHotkey(create);

  return (
    <Button onClick={create}>
      <IconPlus />
      {isLead ? t('lead.add._') : t('customer.add._')}
      <Kbd>C</Kbd>
    </Button>
  );
};

/** Leads: table or board, and the funnel report. */
const LeadViewSwitch = () => {
  const [view, setView] = useQueryState<string>('view');
  const board = view === 'board';
  const option = (active: boolean, onClick: () => void, Icon: typeof IconTable, label: string) => (
    <button
      type="button"
      onClick={onClick}
      className={cn('flex h-7 items-center gap-1.5 rounded px-2 text-sm text-muted-foreground', active && 'bg-background font-medium text-foreground shadow-xs')}
    >
      <Icon className="size-4" />
      {label}
    </button>
  );

  return (
    <>
      <Button variant="ghost" asChild>
        <Link to="/contacts/leads/insights">
          <IconChartFunnel />
          Insights
        </Link>
      </Button>
      <div className="flex rounded-md bg-muted p-0.5">
        {option(!board, () => setView(null), IconTable, 'Table')}
        {option(board, () => setView('board'), IconLayoutKanban, 'Board')}
      </div>
    </>
  );
};

export const CustomersHeader = ({ state }: { state: CustomerState }) => (
  <ContactsPageHeader>
    <ContactsPageHeader.Start>
      <ContactsBreadcrumb />
    </ContactsPageHeader.Start>
    <ContactsPageHeader.End>
      {state === 'lead' && <LeadViewSwitch />}
      <ImportButton recordType={state} />
      <CustomersExportButton state={state} />
      <CustomerCreateButton state={state} />
    </ContactsPageHeader.End>
  </ContactsPageHeader>
);

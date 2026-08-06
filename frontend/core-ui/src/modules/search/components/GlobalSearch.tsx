import type { Icon } from '@tabler/icons-react';
import {
  IconBuildingSkyscraper,
  IconForms,
  IconInbox,
  IconLoader2,
  IconMail,
  IconSearch,
  IconTag,
  IconTicket,
  IconUser,
  IconUsers,
} from '@tabler/icons-react';
import {
  GLOBAL_SEARCH_MIN_LENGTH,
  useGlobalSearch,
} from '@/search/hooks/useGlobalSearch';
import {
  IGlobalSearchChannel,
  IGlobalSearchCompany,
  IGlobalSearchConversation,
  IGlobalSearchCustomer,
  IGlobalSearchDeal,
  IGlobalSearchForm,
  IGlobalSearchProduct,
  IGlobalSearchTeamMember,
  IGlobalSearchTicket,
} from '@/search/types/GlobalSearch';
import { isMacPlatform } from '@/navigation/utils/visitedPageTabShortcuts';
import { Button, cn, Command, Dialog } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';

const SEARCH_DEBOUNCE = 350;

const stripHtml = (value?: string | null) =>
  (value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const getPersonName = (
  person: { firstName?: string | null; lastName?: string | null } | null,
  fallback: string,
) =>
  [person?.firstName, person?.lastName].filter(Boolean).join(' ') || fallback;

const GlobalSearchItem = ({
  id,
  title,
  description,
  icon: Icon,
  onSelect,
}: {
  id: string;
  title: string;
  description?: string;
  icon: Icon;
  onSelect: () => void;
}) => (
  <Command.Item value={id} onSelect={onSelect}>
    <Icon />
    <span className="truncate">{title}</span>
    {!!description && (
      <Command.Shortcut className="truncate">{description}</Command.Shortcut>
    )}
  </Command.Item>
);

const GlobalSearchGroup = ({
  label,
  count,
  children,
}: {
  label: string;
  count: number;
  children: React.ReactNode;
}) => (
  <Command.Group
    heading={
      <span className="flex items-center justify-between gap-2">
        {label}
        <span className="tabular-nums">{count}</span>
      </span>
    }
  >
    {children}
  </Command.Group>
);

export const GlobalSearch = ({ className }: { className?: string }) => {
  const { t } = useTranslation('common', { keyPrefix: 'global-search' });
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [debouncedValue] = useDebounce(value.trim(), SEARCH_DEBOUNCE);

  const {
    customers,
    customersTotalCount,
    companies,
    companiesTotalCount,
    products,
    productsTotalCount,
    teamMembers,
    teamMembersTotalCount,
    conversations,
    conversationsTotalCount,
    tickets,
    ticketsTotalCount,
    channels,
    channelsTotalCount,
    forms,
    formsTotalCount,
    deals,
    dealsTotalCount,
    loading,
    isEmpty,
  } = useGlobalSearch(debouncedValue);

  useEffect(() => {
    const handleOpenSearch = (event: KeyboardEvent) => {
      if (
        event.metaKey !== event.ctrlKey &&
        !event.altKey &&
        !event.shiftKey &&
        event.code === 'KeyK'
      ) {
        event.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener('keydown', handleOpenSearch);

    return () => window.removeEventListener('keydown', handleOpenSearch);
  }, []);

  const openResult = (path: string) => {
    setValue('');
    setOpen(false);
    navigate(path);
  };

  const openCustomer = (customer: IGlobalSearchCustomer) =>
    openResult(`/contacts/customers?contactId=${customer._id}`);

  const openCompany = (company: IGlobalSearchCompany) =>
    openResult(`/contacts/companies?companyId=${company._id}`);

  const openProduct = (product: IGlobalSearchProduct) =>
    openResult(`/settings/products?product_id=${product._id}`);

  const openTeamMember = (member: IGlobalSearchTeamMember) =>
    openResult(`/settings/team/members?user_id=${member._id}`);

  const openConversation = (conversation: IGlobalSearchConversation) =>
    openResult(`/frontline/inbox?conversationId=${conversation._id}`);

  const openTicket = (ticket: IGlobalSearchTicket) =>
    openResult(`/frontline/tickets?ticketId=${ticket._id}`);

  const openChannel = (channel: IGlobalSearchChannel) =>
    openResult(`/frontline/inbox?channelId=${channel._id}`);

  const openForm = (form: IGlobalSearchForm) =>
    openResult(`/frontline/forms/${form._id}`);

  const openDeal = (deal: IGlobalSearchDeal) => {
    const boardId = deal.boardId || deal.pipeline?.boardId;
    const pipelineId = deal.pipeline?._id;

    if (!boardId || !pipelineId) {
      return;
    }

    openResult(
      `/sales/deals?boardId=${boardId}&pipelineId=${pipelineId}&salesItemId=${deal._id}`,
    );
  };

  const isTyping = debouncedValue.length >= GLOBAL_SEARCH_MIN_LENGTH;
  const hasResults =
    customers.length > 0 ||
    companies.length > 0 ||
    products.length > 0 ||
    teamMembers.length > 0 ||
    conversations.length > 0 ||
    tickets.length > 0 ||
    channels.length > 0 ||
    forms.length > 0 ||
    deals.length > 0;

  return (
    <>
      <Button
        aria-keyshortcuts={isMacPlatform() ? 'Meta+K' : 'Control+K'}
        aria-label={t('placeholder', 'Search')}
        className={cn('size-8 shrink-0 text-muted-foreground', className)}
        onClick={() => setOpen(true)}
        size="icon"
        title={`${t('placeholder', 'Search')} (${
          isMacPlatform() ? '⌘ K' : 'Ctrl K'
        })`}
        type="button"
        variant="ghost"
      >
        <IconSearch className="size-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <Dialog.Content className="max-w-md overflow-hidden rounded-lg border-0 p-0">
          <Dialog.Title className="sr-only">
            {t('placeholder', 'Search')}
          </Dialog.Title>
          <Dialog.Description className="sr-only">
            {t('placeholder', 'Search')}
          </Dialog.Description>
          <Command
            shouldFilter={false}
            className="**:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 **:[[cmdk-group]]:px-2"
          >
            <Command.Input
              focusOnMount
              variant="primary"
              placeholder={t('placeholder', 'Search')}
              value={value}
              onValueChange={setValue}
            />
            <Command.List className="styled-scroll min-h-32">
              {!isTyping && (
                <div className="flex h-32 flex-col items-center justify-center gap-2 px-6 text-center">
                  <IconSearch className="size-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {t(
                      'hint',
                      'Search contacts, conversations, tickets, deals, products and more',
                    )}
                  </span>
                </div>
              )}

              {isTyping && loading && !hasResults && (
                <div className="flex h-32 items-center justify-center gap-2 text-sm text-muted-foreground">
                  <IconLoader2 className="size-4 animate-spin" />
                  {t('loading', 'Loading...')}
                </div>
              )}

              {isTyping && isEmpty && (
                <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                  {t('no-results', 'No results')}
                </div>
              )}

              {customers.length > 0 && (
                <GlobalSearchGroup
                  label={t('contacts', 'Contacts')}
                  count={customersTotalCount}
                >
                  {customers.map((customer) => (
                    <GlobalSearchItem
                      key={customer._id}
                      id={customer._id}
                      icon={IconUser}
                      title={getPersonName(customer, t('unnamed', 'Unnamed'))}
                      description={
                        customer.primaryEmail ||
                        customer.primaryPhone ||
                        undefined
                      }
                      onSelect={() => openCustomer(customer)}
                    />
                  ))}
                </GlobalSearchGroup>
              )}

              {companies.length > 0 && (
                <GlobalSearchGroup
                  label={t('companies', 'Companies')}
                  count={companiesTotalCount}
                >
                  {companies.map((company) => (
                    <GlobalSearchItem
                      key={company._id}
                      id={company._id}
                      icon={IconBuildingSkyscraper}
                      title={company.primaryName || t('unnamed', 'Unnamed')}
                      description={
                        company.primaryEmail ||
                        company.primaryPhone ||
                        undefined
                      }
                      onSelect={() => openCompany(company)}
                    />
                  ))}
                </GlobalSearchGroup>
              )}

              {conversations.length > 0 && (
                <GlobalSearchGroup
                  label={t('conversations', 'Conversations')}
                  count={conversationsTotalCount}
                >
                  {conversations.map((conversation) => (
                    <GlobalSearchItem
                      key={conversation._id}
                      id={conversation._id}
                      icon={IconMail}
                      title={getPersonName(
                        conversation.customer || null,
                        conversation.customer?.primaryEmail ||
                          t('unnamed', 'Unnamed'),
                      )}
                      description={stripHtml(conversation.content)}
                      onSelect={() => openConversation(conversation)}
                    />
                  ))}
                </GlobalSearchGroup>
              )}

              {tickets.length > 0 && (
                <GlobalSearchGroup
                  label={t('tickets', 'Tickets')}
                  count={ticketsTotalCount}
                >
                  {tickets.map((ticket) => (
                    <GlobalSearchItem
                      key={ticket._id}
                      id={ticket._id}
                      icon={IconTicket}
                      title={ticket.name || t('unnamed', 'Unnamed')}
                      description={
                        ticket.number ? `#${ticket.number}` : undefined
                      }
                      onSelect={() => openTicket(ticket)}
                    />
                  ))}
                </GlobalSearchGroup>
              )}

              {deals.length > 0 && (
                <GlobalSearchGroup
                  label={t('deals', 'Deals')}
                  count={dealsTotalCount}
                >
                  {deals.map((deal) => (
                    <GlobalSearchItem
                      key={deal._id}
                      id={deal._id}
                      icon={IconTag}
                      title={deal.name || t('unnamed', 'Unnamed')}
                      description={deal.number ? `#${deal.number}` : undefined}
                      onSelect={() => openDeal(deal)}
                    />
                  ))}
                </GlobalSearchGroup>
              )}

              {products.length > 0 && (
                <GlobalSearchGroup
                  label={t('products', 'Products')}
                  count={productsTotalCount}
                >
                  {products.map((product) => (
                    <GlobalSearchItem
                      key={product._id}
                      id={product._id}
                      icon={IconTag}
                      title={product.name || t('unnamed', 'Unnamed')}
                      description={product.code || undefined}
                      onSelect={() => openProduct(product)}
                    />
                  ))}
                </GlobalSearchGroup>
              )}

              {teamMembers.length > 0 && (
                <GlobalSearchGroup
                  label={t('team-members', 'Team members')}
                  count={teamMembersTotalCount}
                >
                  {teamMembers.map((member) => (
                    <GlobalSearchItem
                      key={member._id}
                      id={member._id}
                      icon={IconUsers}
                      title={
                        member.details?.fullName ||
                        member.username ||
                        t('unnamed', 'Unnamed')
                      }
                      description={member.email || undefined}
                      onSelect={() => openTeamMember(member)}
                    />
                  ))}
                </GlobalSearchGroup>
              )}

              {channels.length > 0 && (
                <GlobalSearchGroup
                  label={t('channels', 'Channels')}
                  count={channelsTotalCount}
                >
                  {channels.map((channel) => (
                    <GlobalSearchItem
                      key={channel._id}
                      id={channel._id}
                      icon={IconInbox}
                      title={channel.name || t('unnamed', 'Unnamed')}
                      description={channel.description || undefined}
                      onSelect={() => openChannel(channel)}
                    />
                  ))}
                </GlobalSearchGroup>
              )}

              {forms.length > 0 && (
                <GlobalSearchGroup
                  label={t('forms', 'Forms')}
                  count={formsTotalCount}
                >
                  {forms.map((form) => (
                    <GlobalSearchItem
                      key={form._id}
                      id={form._id}
                      icon={IconForms}
                      title={form.name || form.title || t('unnamed', 'Unnamed')}
                      description={form.code || undefined}
                      onSelect={() => openForm(form)}
                    />
                  ))}
                </GlobalSearchGroup>
              )}
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog>
    </>
  );
};

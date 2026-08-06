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

interface IGlobalSearchResultItem {
  id: string;
  title: string;
  description?: string;
  onSelect: () => void;
}

interface IGlobalSearchResultGroup {
  key: string;
  label: string;
  count: number;
  icon: Icon;
  items: IGlobalSearchResultItem[];
}

type OpenResult = (path: string) => void;

const stripHtml = (value?: string | null) => {
  if (!value) {
    return '';
  }

  const { body } = new DOMParser().parseFromString(value, 'text/html');

  return (body.textContent || '').replaceAll(/\s+/g, ' ').trim();
};

const getPersonName = (
  person: { firstName?: string | null; lastName?: string | null } | null,
  fallback: string,
) =>
  [person?.firstName, person?.lastName].filter(Boolean).join(' ') || fallback;

const getDealPath = (deal: IGlobalSearchDeal) => {
  const boardId = deal.boardId || deal.pipeline?.boardId;
  const pipelineId = deal.pipeline?._id;

  if (!boardId || !pipelineId) {
    return null;
  }

  return `/sales/deals?boardId=${boardId}&pipelineId=${pipelineId}&salesItemId=${deal._id}`;
};

const buildCustomerItems = (
  customers: IGlobalSearchCustomer[],
  unnamed: string,
  openResult: OpenResult,
): IGlobalSearchResultItem[] =>
  customers.map((customer) => ({
    id: customer._id,
    title: getPersonName(customer, unnamed),
    description: customer.primaryEmail || customer.primaryPhone || undefined,
    onSelect: () => openResult(`/contacts/customers?contactId=${customer._id}`),
  }));

const buildCompanyItems = (
  companies: IGlobalSearchCompany[],
  unnamed: string,
  openResult: OpenResult,
): IGlobalSearchResultItem[] =>
  companies.map((company) => ({
    id: company._id,
    title: company.primaryName || unnamed,
    description: company.primaryEmail || company.primaryPhone || undefined,
    onSelect: () => openResult(`/contacts/companies?companyId=${company._id}`),
  }));

const buildConversationItems = (
  conversations: IGlobalSearchConversation[],
  unnamed: string,
  openResult: OpenResult,
): IGlobalSearchResultItem[] =>
  conversations.map((conversation) => ({
    id: conversation._id,
    title: getPersonName(
      conversation.customer || null,
      conversation.customer?.primaryEmail || unnamed,
    ),
    description: stripHtml(conversation.content),
    onSelect: () =>
      openResult(`/frontline/inbox?conversationId=${conversation._id}`),
  }));

const buildTicketItems = (
  tickets: IGlobalSearchTicket[],
  unnamed: string,
  openResult: OpenResult,
): IGlobalSearchResultItem[] =>
  tickets.map((ticket) => ({
    id: ticket._id,
    title: ticket.name || unnamed,
    description: ticket.number ? `#${ticket.number}` : undefined,
    onSelect: () => openResult(`/frontline/tickets?ticketId=${ticket._id}`),
  }));

const buildDealItems = (
  deals: IGlobalSearchDeal[],
  unnamed: string,
  openResult: OpenResult,
): IGlobalSearchResultItem[] =>
  deals.flatMap((deal) => {
    const path = getDealPath(deal);

    if (!path) {
      return [];
    }

    return [
      {
        id: deal._id,
        title: deal.name || unnamed,
        description: deal.number ? `#${deal.number}` : undefined,
        onSelect: () => openResult(path),
      },
    ];
  });

const buildProductItems = (
  products: IGlobalSearchProduct[],
  unnamed: string,
  openResult: OpenResult,
): IGlobalSearchResultItem[] =>
  products.map((product) => ({
    id: product._id,
    title: product.name || unnamed,
    description: product.code || undefined,
    onSelect: () => openResult(`/settings/products?product_id=${product._id}`),
  }));

const buildTeamMemberItems = (
  teamMembers: IGlobalSearchTeamMember[],
  unnamed: string,
  openResult: OpenResult,
): IGlobalSearchResultItem[] =>
  teamMembers.map((member) => ({
    id: member._id,
    title: member.details?.fullName || member.username || unnamed,
    description: member.email || undefined,
    onSelect: () => openResult(`/settings/team/members?user_id=${member._id}`),
  }));

const buildChannelItems = (
  channels: IGlobalSearchChannel[],
  unnamed: string,
  openResult: OpenResult,
): IGlobalSearchResultItem[] =>
  channels.map((channel) => ({
    id: channel._id,
    title: channel.name || unnamed,
    description: channel.description || undefined,
    onSelect: () => openResult(`/frontline/inbox?channelId=${channel._id}`),
  }));

const buildFormItems = (
  forms: IGlobalSearchForm[],
  unnamed: string,
  openResult: OpenResult,
): IGlobalSearchResultItem[] =>
  forms.map((form) => ({
    id: form._id,
    title: form.name || form.title || unnamed,
    description: form.code || undefined,
    onSelect: () => openResult(`/frontline/forms/${form._id}`),
  }));

const GlobalSearchItem = ({
  item,
  icon: Icon,
}: {
  item: IGlobalSearchResultItem;
  icon: Icon;
}) => (
  <Command.Item value={item.id} onSelect={item.onSelect}>
    <Icon />
    <span className="truncate">{item.title}</span>
    {Boolean(item.description) && (
      <Command.Shortcut className="truncate">
        {item.description}
      </Command.Shortcut>
    )}
  </Command.Item>
);

const GlobalSearchGroup = ({ group }: { group: IGlobalSearchResultGroup }) => {
  if (group.items.length === 0) {
    return null;
  }

  return (
    <Command.Group
      heading={
        <span className="flex items-center justify-between gap-2">
          {group.label}
          <span className="tabular-nums">{group.count}</span>
        </span>
      }
    >
      {group.items.map((item) => (
        <GlobalSearchItem key={item.id} item={item} icon={group.icon} />
      ))}
    </Command.Group>
  );
};

const GlobalSearchTrigger = ({
  className,
  label,
  onClick,
}: {
  className?: string;
  label: string;
  onClick: () => void;
}) => {
  const isMac = isMacPlatform();

  return (
    <Button
      aria-keyshortcuts={isMac ? 'Meta+K' : 'Control+K'}
      aria-label={label}
      className={cn('size-8 shrink-0 text-muted-foreground', className)}
      onClick={onClick}
      size="icon"
      title={`${label} (${isMac ? '⌘ K' : 'Ctrl K'})`}
      type="button"
      variant="ghost"
    >
      <IconSearch className="size-4" />
    </Button>
  );
};

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
  } = useGlobalSearch(debouncedValue);

  useEffect(() => {
    const handleOpenSearch = (event: KeyboardEvent) => {
      const hasSearchModifier = isMacPlatform()
        ? event.metaKey && !event.ctrlKey
        : event.ctrlKey && !event.metaKey;

      if (
        hasSearchModifier &&
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

  const openResult: OpenResult = (path) => {
    setValue('');
    setOpen(false);
    navigate(path);
  };

  const unnamed = t('unnamed', 'Unnamed');

  const groups: IGlobalSearchResultGroup[] = [
    {
      key: 'contacts',
      label: t('contacts', 'Contacts'),
      count: customersTotalCount,
      icon: IconUser,
      items: buildCustomerItems(customers, unnamed, openResult),
    },
    {
      key: 'companies',
      label: t('companies', 'Companies'),
      count: companiesTotalCount,
      icon: IconBuildingSkyscraper,
      items: buildCompanyItems(companies, unnamed, openResult),
    },
    {
      key: 'conversations',
      label: t('conversations', 'Conversations'),
      count: conversationsTotalCount,
      icon: IconMail,
      items: buildConversationItems(conversations, unnamed, openResult),
    },
    {
      key: 'tickets',
      label: t('tickets', 'Tickets'),
      count: ticketsTotalCount,
      icon: IconTicket,
      items: buildTicketItems(tickets, unnamed, openResult),
    },
    {
      key: 'deals',
      label: t('deals', 'Deals'),
      count: dealsTotalCount,
      icon: IconTag,
      items: buildDealItems(deals, unnamed, openResult),
    },
    {
      key: 'products',
      label: t('products', 'Products'),
      count: productsTotalCount,
      icon: IconTag,
      items: buildProductItems(products, unnamed, openResult),
    },
    {
      key: 'team-members',
      label: t('team-members', 'Team members'),
      count: teamMembersTotalCount,
      icon: IconUsers,
      items: buildTeamMemberItems(teamMembers, unnamed, openResult),
    },
    {
      key: 'channels',
      label: t('channels', 'Channels'),
      count: channelsTotalCount,
      icon: IconInbox,
      items: buildChannelItems(channels, unnamed, openResult),
    },
    {
      key: 'forms',
      label: t('forms', 'Forms'),
      count: formsTotalCount,
      icon: IconForms,
      items: buildFormItems(forms, unnamed, openResult),
    },
  ];

  const isTyping = debouncedValue.length >= GLOBAL_SEARCH_MIN_LENGTH;
  const hasResults = groups.some((group) => group.items.length > 0);

  return (
    <>
      <GlobalSearchTrigger
        className={className}
        label={t('placeholder', 'Search')}
        onClick={() => setOpen(true)}
      />

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

              {isTyping && !loading && !hasResults && (
                <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                  {t('no-results', 'No results')}
                </div>
              )}

              {groups.map((group) => (
                <GlobalSearchGroup key={group.key} group={group} />
              ))}
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog>
    </>
  );
};

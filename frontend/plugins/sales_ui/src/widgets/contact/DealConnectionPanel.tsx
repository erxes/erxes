import { IconPlus, IconSandbox } from '@tabler/icons-react';
import { Button, Combobox, Command } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useSidePanel, useSidePanelDraft } from 'ui-modules';
import {
  DEAL_CONNECTION_CONTENT_TYPE,
  getDealContactUpdate,
  TDealConnectionContact,
} from './dealContactConnection';
import { useDealConnection } from './useDealConnection';
import { useDealConnectionAccess } from './useDealConnectionAccess';

const isContact = (
  contact: Partial<TDealConnectionContact>,
): contact is TDealConnectionContact =>
  Boolean(contact.contentId) &&
  (contact.contentType === 'core:customer' ||
    contact.contentType === 'core:company');

const DealConnectionList = ({
  contact,
  onClose,
}: {
  contact: TDealConnectionContact;
  onClose: () => void;
}) => {
  const { t } = useTranslation('sales');
  const { openNewRecord } = useSidePanel();
  const connection = useDealConnection(contact, onClose);
  const { canCreate } = useDealConnectionAccess();
  const isCompany = contact.contentType === 'core:company';
  const contactKey = isCompany ? 'companyId' : 'customerId';
  const contacts = isCompany
    ? { companyId: contact.contentId }
    : { customerId: contact.contentId };
  const { connecting, deals } = connection;

  return (
    <section
      aria-label={t('connect-deal', 'Connect deal')}
      className="flex min-h-0 min-w-0 flex-1 flex-col bg-background"
    >
      <div className="px-3 py-3">
        <p className="text-xs text-muted-foreground">
          {isCompany
            ? t(
                'connect-deal-company-help',
                'Choose a deal without a company. Deals that already have a company cannot be selected.',
              )
            : t(
                'connect-deal-customer-help',
                'Choose a deal without a customer. Deals that already have a customer cannot be selected.',
              )}
        </p>
      </div>
      <Command shouldFilter={false} className="min-h-0 flex-1 rounded-none">
        <div className="flex items-center gap-2 border-b pr-3">
          <Command.Input
            variant="primary"
            wrapperClassName="min-w-0 flex-1 border-0"
            placeholder={t('search-deals', 'Search deals...')}
            aria-label={t('search-deals', 'Search deals...')}
            value={connection.search}
            onValueChange={connection.setSearch}
            disabled={connecting}
            focusOnMount
          />
          {canCreate && (
            <Button
              variant="secondary"
              size="sm"
              className="shrink-0"
              disabled={connecting}
              onClick={() =>
                openNewRecord('sales:deal', contacts, { replace: true })
              }
              onKeyDown={(event) => {
                if (event.key === 'Enter') event.stopPropagation();
              }}
            >
              <IconPlus className="size-4" />
              {t('create-deal', 'Create deal')}
            </Button>
          )}
        </div>
        <Command.List
          aria-label={t('existing-deals', 'Existing deals')}
          className="max-h-none flex-1"
        >
          {connection.error ? (
            <div role="alert" className="p-4 text-sm text-muted-foreground">
              <p>{connection.error.message}</p>
              <Button variant="ghost" size="sm" onClick={connection.retry}>
                {t('retry', 'Retry')}
              </Button>
            </div>
          ) : (
            <>
              <Combobox.Empty loading={connection.loading} />
              {deals.map((deal) => (
                <Command.Item
                  key={deal._id}
                  value={deal._id}
                  disabled={
                    connecting ||
                    connection.loading ||
                    connection.searchPending ||
                    !getDealContactUpdate(deal, contact)
                  }
                  onSelect={() => void connection.connectDeal(deal._id)}
                  className="gap-2"
                >
                  <IconSandbox className="size-4 shrink-0 text-muted-foreground" />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate">
                      {deal.name || t('untitled', 'Untitled')}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {[deal.number && `#${deal.number}`, deal.stage?.name]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  </span>
                  {deal[contactKey] && (
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {deal[contactKey] === contact.contentId
                        ? t('already-connected', 'Already connected')
                        : t('linked-to-another-contact', 'Linked elsewhere')}
                    </span>
                  )}
                </Command.Item>
              ))}
              {connection.hasNextPage && (
                <Combobox.FetchMore
                  key={connection.pageKey}
                  fetchMore={connection.loadMore}
                  currentLength={deals.length}
                  totalCount={connection.totalCount}
                />
              )}
            </>
          )}
        </Command.List>
      </Command>
      <div className="flex items-center justify-between border-t p-3">
        {connecting ? (
          <p role="status" className="text-xs text-muted-foreground">
            {t('connecting-deal', 'Connecting deal...')}
          </p>
        ) : (
          <span />
        )}
        <Button
          variant="secondary"
          size="sm"
          disabled={connecting}
          onClick={onClose}
        >
          {t('cancel', 'Cancel')}
        </Button>
      </div>
    </section>
  );
};

export const DealConnectionPanel = () => {
  const { t } = useTranslation('sales');
  const contact = useSidePanelDraft<TDealConnectionContact>(
    DEAL_CONNECTION_CONTENT_TYPE,
  );
  const { back, canGoBack, close } = useSidePanel();
  const { isLoaded, canLink } = useDealConnectionAccess();
  const cancel = canGoBack ? back : close;

  if (!isLoaded) {
    return null;
  }

  if (!isContact(contact) || !canLink) {
    return (
      <div className="space-y-3 p-4 text-sm">
        <p className="text-muted-foreground">
          {isContact(contact)
            ? t(
                'deal-connection-no-permission',
                'You do not have permission to connect deals.',
              )
            : t(
                'deal-connection-contact-required',
                'Open a customer or company to connect a deal.',
              )}
        </p>
        <Button variant="secondary" onClick={cancel}>
          {t('cancel', 'Cancel')}
        </Button>
      </div>
    );
  }

  return <DealConnectionList contact={contact} onClose={cancel} />;
};

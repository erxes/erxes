import type { Company, Customer } from '@erxes/core-contract';
import { IconAlignLeft, IconHierarchy2, IconHistory, IconId, IconLayoutSidebarRight } from '@tabler/icons-react';
import { Avatar, Empty, readImage, Skeleton, useQueryState } from 'erxes-ui';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { type ReactNode, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ActivityTimeline } from '~/modules/activity/ActivityTimeline';
import { useCompany } from '~/modules/contacts/companies/useCompanies';
import { companyTitle, customerTitle } from '~/modules/contacts/components/ContactPicker';
import { useCustomer } from '~/modules/contacts/customers/useCustomers';
import { getContactDetailPath, isContactContentType } from '~/modules/contacts/utils/contactDetailPath';
import { CompanyPanelDetail } from './details/CompanyPanelDetail';
import { CompanyPanelNew } from './details/CompanyPanelNew';
import { ContactDetailHeader } from './details/ContactDetailHeader';
import { ContactPanelActions, ContactPanelIdentity, ContactPanelWebsiteLink } from './details/ContactPanelActions';
import { ContactPanelDescription } from './details/ContactPanelDescription';
import { CompanyPanelName, CustomerPanelName } from './details/ContactPanelNames';
import { CompanyPanelProperties, CustomerPanelProperties } from './details/ContactPanelProperties';
import { CustomerPanelNew } from './details/CustomerPanelNew';
import { CustomerPanelDetail } from './details/CustomerPanelDetail';
import { type IRecordSidePanelTab, RecordSidePanel, usePanelExpanded } from './RecordSidePanel';
import type { IRecordViewProps } from './recordView';
import { SidePanelRecordStack } from './SidePanelRecordStack';
import { NEW_RECORD_ID, SIDE_PANEL_ROOT_PATH, type TRelationEntity } from './sidePanelPaths';
import { LeadHeaderActions } from '~/modules/leads/LeadHeaderActions';
import { sidePanelWidthState, useSidePanel } from './useSidePanel';

const DETAIL_TAB = 'detail';
const PROPERTIES_TAB = 'properties';
const DESCRIPTION_TAB = 'description';
const ACTIVITY_TAB = 'activity';

/** Displays the contact avatar or its initials when no image is available. */
const RecordAvatar = ({ src, name }: { src?: string | null; name?: string }) => (
  <Avatar size="lg" className="size-7 flex-none">
    <Avatar.Image src={readImage(src ?? undefined)} />
    <Avatar.Fallback>{name?.charAt(0)}</Avatar.Fallback>
  </Avatar>
);

// `sales:deal` reads as "Deal".
const getContentTypeLabel = (contentType: string) => {
  const name = contentType.split(':').pop() || contentType;

  return name.charAt(0).toUpperCase() + name.slice(1);
};

/** Explains empty and failed records without mounting their editors. */
const SidePanelEmpty = ({
  title,
  description,
  onBack,
  onClose,
}: {
  title: string;
  description: string;
  onBack?: () => void;
  onClose?: () => void;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });

  return (
    <>
      <RecordSidePanel.Header title={t('title', 'Side panel')} onBack={onBack} onClose={onClose} />
      <div className="flex flex-1 items-center justify-center p-6">
        <Empty>
          <Empty.Header>
            <Empty.Media variant="icon">
              <IconLayoutSidebarRight />
            </Empty.Media>
            <Empty.Title>{title}</Empty.Title>
            <Empty.Description>{description}</Empty.Description>
          </Empty.Header>
        </Empty>
      </div>
    </>
  );
};

/** The open contact: its name, avatar and the record itself, or why it is missing. */
const useRecordHeading = ({ contentType, contentId }: TRelationEntity) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  const isCustomer = contentType === 'core:customer';
  const customerQuery = useCustomer(isCustomer ? contentId : null);
  const companyQuery = useCompany(isCustomer ? null : contentId);
  const query = isCustomer ? customerQuery : companyQuery;
  const untitled = t('untitled', 'Untitled');
  const customer: Customer | undefined = isCustomer ? customerQuery.data : undefined;
  const company: Company | undefined = isCustomer ? undefined : companyQuery.data;

  if (customer) {
    const title = customerTitle(customer) || untitled;

    return { title, avatar: <RecordAvatar src={customer.avatarUrl} name={title} />, customer };
  }

  if (company) {
    const title = companyTitle(company) || untitled;

    return {
      title,
      avatar: <RecordAvatar src={company.avatarUrl} name={title} />,
      website: company.website,
      company,
    };
  }

  if (query.isPending) {
    // Still loading: placeholders, never the raw content type.
    return {
      title: <Skeleton className="h-4 w-32" />,
      avatar: <Skeleton className="size-7 flex-none rounded-full" />,
    };
  }

  const notFound = (query.error as { status?: number } | null)?.status === 404;

  return {
    title: notFound ? t('not-found-title', 'Nothing here') : t('error', 'Unable to load record'),
    state: notFound ? ('not-found' as const) : ('error' as const),
  };
};

/** A saved customer or company: header, then Detail / Properties (/ Description) tabs. */
const SidePanelSavedRecord = ({ record, onBack, onClose }: IRecordViewProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  const expanded = usePanelExpanded();
  const { tab: selectedTab, setTab } = useSidePanel();
  const { title, avatar, website, customer, company, state } = useRecordHeading(record);
  const contactType = record.contentType === 'core:company' ? 'core:company' : 'core:customer';
  const isCustomer = contactType === 'core:customer';

  if (state) {
    return (
      <SidePanelEmpty
        title={state === 'error' ? t('error', 'Unable to load record') : t('not-found-title', 'Nothing here')}
        description={
          state === 'error'
            ? t('record-load-error', 'Please close the panel and try again.')
            : t('record-not-found', 'This record no longer exists.')
        }
        onBack={onBack}
        onClose={onClose}
      />
    );
  }

  let editableTitle: ReactNode = title;

  if (customer) editableTitle = <CustomerPanelName customer={customer} />;
  if (company) editableTitle = <CompanyPanelName company={company} />;

  const tabs: IRecordSidePanelTab[] = [
    {
      value: DETAIL_TAB,
      label: t('detail', 'Detail'),
      icon: IconId,
      content: isCustomer ? (
        <CustomerPanelDetail customerId={record.contentId} />
      ) : (
        <CompanyPanelDetail companyId={record.contentId} />
      ),
    },
    {
      value: PROPERTIES_TAB,
      label: t('properties', 'Properties'),
      icon: IconHierarchy2,
      content: isCustomer ? (
        <CustomerPanelProperties customerId={record.contentId} />
      ) : (
        <CompanyPanelProperties companyId={record.contentId} />
      ),
    },
    {
      value: ACTIVITY_TAB,
      label: t('activity', 'Activity'),
      icon: IconHistory,
      content: (
        <ActivityTimeline targetType={isCustomer ? 'customer' : 'company'} targetId={record.contentId} />
      ),
    },
    // A full page edits the description in its own tab.
    ...(expanded
      ? [
          {
            value: DESCRIPTION_TAB,
            label: t('description', 'Description'),
            icon: IconAlignLeft,
            content: (
              <ContactPanelDescription
                contentType={contactType}
                contentId={record.contentId}
                value={customer?.description || company?.description || ''}
                loading={!customer && !company}
              />
            ),
          },
        ]
      : []),
  ];
  const tab = selectedTab && tabs.some((entry) => entry.value === selectedTab) ? selectedTab : DETAIL_TAB;
  const actions = (
    <>
      <LeadHeaderActions recordType={contactType === 'core:company' ? 'company' : 'customer'} record={contactType === 'core:company' ? company : customer} />
      <ContactPanelActions contentType={contactType} contentId={record.contentId} state={(contactType === 'core:company' ? company : customer)?.state} />
    </>
  );

  return (
    <>
      {expanded ? (
        <ContactDetailHeader title={title} actions={actions} />
      ) : (
        <RecordSidePanel.Header
          avatar={avatar}
          title={editableTitle}
          actions={
            <>
              <ContactPanelWebsiteLink website={website} />
              {actions}
            </>
          }
          onBack={onBack}
          onClose={onClose}
        />
      )}
      <RecordSidePanel.Layout
        tabs={tabs}
        value={tab}
        onValueChange={setTab}
        visibleCount={8}
        overviewTab={DETAIL_TAB}
        overviewHeader={<ContactPanelIdentity title={editableTitle} avatar={avatar} website={website} />}
        expandedDefaultTab={PROPERTIES_TAB}
      />
    </>
  );
};

// A record not created yet: its draft, saved as the record on Save.
const SidePanelDraft = ({ record, onBack, onClose }: IRecordViewProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });

  return (
    <>
      <RecordSidePanel.Header
        title={t('new-record', 'New {{type}}', { type: getContentTypeLabel(record.contentType).toLowerCase() })}
        onBack={onBack}
        onClose={onClose}
      />
      <div className="flex flex-1 min-h-0 flex-col">
        {record.contentType === 'core:customer' ? <CustomerPanelNew /> : <CompanyPanelNew />}
      </div>
    </>
  );
};

/**
 * A record as the side panel shows it, or its draft. A record's own page
 * draws it too, expanded (`ContactDetailPage`).
 */
export const SidePanelRecord = (props: IRecordViewProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });

  if (!isContactContentType(props.record.contentType)) {
    return (
      <SidePanelEmpty
        title={t('not-found-title', 'Nothing here')}
        description={t('not-found-description', 'This panel link does not point to a record.')}
        onBack={props.onBack}
        onClose={props.onClose}
      />
    );
  }

  return props.record.contentId === NEW_RECORD_ID ? (
    <SidePanelDraft {...props} />
  ) : (
    <SidePanelSavedRecord {...props} />
  );
};

// How many app-wide panels are mounted (MainLayout). While none is, an app
// can draw its own (`fallback`) so records still open beside its pages.
const sidePanelHostCountState = atom(0);

/**
 * The app-wide side panel: a column right of the page. What it shows is its
 * own route, kept in the `panel` query param (`?panel=/detail/customer/<id>`),
 * so it can be linked and reloaded. `fallback` draws it only while no
 * app-wide one is mounted.
 */
export const SidePanelLayout = ({ fallback = false }: { fallback?: boolean }) => {
  const hostCount = useAtomValue(sidePanelHostCountState);
  const setHostCount = useSetAtom(sidePanelHostCountState);

  useLayoutEffect(() => {
    if (fallback) return undefined;

    setHostCount((count) => count + 1);

    return () => setHostCount((count) => count - 1);
  }, [fallback, setHostCount]);

  if (fallback && hostCount > 0) return null;

  return <SidePanelColumn />;
};

const SidePanelColumn = () => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  const { open, path, history, record, close, canGoBack, back } = useSidePanel();
  const [width, setWidth] = useAtom(sidePanelWidthState);
  const [expanded] = useQueryState<boolean>('panelExpanded');
  const { pathname } = useLocation();
  const navigate = useNavigate();
  // Contacts expand into their own pages.
  const recordPage =
    record && record.contentId !== NEW_RECORD_ID && isContactContentType(record.contentType)
      ? getContactDetailPath(record.contentType, record.contentId, pathname)
      : null;

  /** Selects the retained record stack or a recoverable empty state. */
  const renderRoute = () => {
    if (record) {
      return (
        <SidePanelRecordStack
          path={path || ''}
          history={history}
          View={SidePanelRecord}
          onBack={canGoBack ? back : undefined}
          onClose={close}
        />
      );
    }

    if (path === SIDE_PANEL_ROOT_PATH) {
      return (
        <SidePanelEmpty
          title={t('empty-title', 'Nothing open')}
          description={t('empty-description', 'Open a record to see it and everything related to it here.')}
          onClose={close}
        />
      );
    }

    return (
      <SidePanelEmpty
        title={t('not-found-title', 'Nothing here')}
        description={t('not-found-description', 'This panel link does not point to a record.')}
        onClose={close}
      />
    );
  };

  return (
    <>
      {/* Links saved while records still expanded in place. */}
      {recordPage && expanded && <Navigate to={recordPage} replace />}
      {open && !(recordPage && expanded) && (
        <RecordSidePanel
          key="record"
          expanded={false}
          expandable={Boolean(recordPage)}
          onExpandedChange={() => {
            if (recordPage) navigate(recordPage);
          }}
          width={width}
          onWidthChange={setWidth}
        >
          {renderRoute()}
        </RecordSidePanel>
      )}
    </>
  );
};

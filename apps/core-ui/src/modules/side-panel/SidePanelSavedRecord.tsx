import type { Company, Customer } from '@erxes/core-contract';
import { IconAlignLeft, IconHierarchy2, IconHistory, IconId } from '@tabler/icons-react';
import { Skeleton } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { AvatarEditor } from '~/components/AvatarEditor';
import { isApiError } from '~/lib/api';
import { ActivityTimeline } from '~/modules/activity/ActivityTimeline';
import { useCan } from '~/modules/auth/session';
import { useCompany, useCompanyEdit } from '~/modules/contacts/companies/useCompanies';
import { companyTitle, customerTitle } from '~/modules/contacts/components/ContactPicker';
import { useCustomer, useCustomerEdit } from '~/modules/contacts/customers/useCustomers';
import { LeadHeaderActions } from '~/modules/leads/LeadHeaderActions';
import { CompanyPanelDetail } from './details/CompanyPanelDetail';
import { ContactDetailHeader } from './details/ContactDetailHeader';
import {
  ContactPanelActions,
  ContactPanelIdentity,
  ContactPanelWebsiteLink,
} from './details/ContactPanelActions';
import { ContactPanelDescription } from './details/ContactPanelDescription';
import { CompanyPanelName, CustomerPanelName } from './details/ContactPanelNames';
import { CompanyPanelProperties, CustomerPanelProperties } from './details/ContactPanelProperties';
import { CustomerPanelDetail } from './details/CustomerPanelDetail';
import { type IRecordSidePanelTab, RecordSidePanel, usePanelExpanded } from './RecordSidePanel';
import type { IRecordViewProps } from './recordView';
import { SidePanelEmpty } from './SidePanelEmpty';
import type { TRelationEntity } from './sidePanelPaths';
import { useSidePanel } from './useSidePanel';

const DETAIL_TAB = 'detail';
const PROPERTIES_TAB = 'properties';
const DESCRIPTION_TAB = 'description';
const ACTIVITY_TAB = 'activity';

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
  const customerEdit = useCustomerEdit();
  const companyEdit = useCompanyEdit();
  // Who may edit contacts changes the picture from the header (as erxes does).
  const canEdit = useCan()('contacts.edit');

  if (customer) {
    const title = customerTitle(customer) || untitled;

    return {
      title,
      avatar: (
        <AvatarEditor
          src={customer.avatarUrl}
          name={title}
          canEdit={canEdit}
          onSave={(avatarUrl) => customerEdit.mutate({ id: customer.id, avatarUrl })}
        />
      ),
      customer,
    };
  }

  if (company) {
    const title = companyTitle(company) || untitled;

    return {
      title,
      avatar: (
        <AvatarEditor
          src={company.avatarUrl}
          name={title}
          canEdit={canEdit}
          onSave={(avatarUrl) => companyEdit.mutate({ id: company.id, avatarUrl })}
        />
      ),
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

  const notFound = isApiError(query.error) && query.error.status === 404;

  return { state: notFound ? ('not-found' as const) : ('error' as const) };
};

/** Detail, Properties and Activity; a full page adds Description. */
const useContactTabs = ({
  contentType,
  contentId,
  description,
}: {
  contentType: 'core:customer' | 'core:company';
  contentId: string;
  /** Undefined until the record loads. */
  description: string | undefined;
}): IRecordSidePanelTab[] => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  const expanded = usePanelExpanded();
  const isCustomer = contentType === 'core:customer';

  const tabs: IRecordSidePanelTab[] = [
    {
      value: DETAIL_TAB,
      label: t('detail', 'Detail'),
      icon: IconId,
      content: isCustomer ? (
        <CustomerPanelDetail customerId={contentId} />
      ) : (
        <CompanyPanelDetail companyId={contentId} />
      ),
    },
    {
      value: PROPERTIES_TAB,
      label: t('properties', 'Properties'),
      icon: IconHierarchy2,
      content: isCustomer ? (
        <CustomerPanelProperties customerId={contentId} />
      ) : (
        <CompanyPanelProperties companyId={contentId} />
      ),
    },
    {
      value: ACTIVITY_TAB,
      label: t('activity', 'Activity'),
      icon: IconHistory,
      content: (
        <ActivityTimeline targetType={isCustomer ? 'customer' : 'company'} targetId={contentId} />
      ),
    },
  ];

  if (!expanded) return tabs;

  // A full page edits the description in its own tab.
  return [
    ...tabs,
    {
      value: DESCRIPTION_TAB,
      label: t('description', 'Description'),
      icon: IconAlignLeft,
      content: (
        <ContactPanelDescription
          contentType={contentType}
          contentId={contentId}
          value={description ?? ''}
          loading={description === undefined}
        />
      ),
    },
  ];
};

const SidePanelFailed = ({
  state,
  onBack,
  onClose,
}: {
  state: 'error' | 'not-found';
  onBack?: () => void;
  onClose?: () => void;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });

  return state === 'error' ? (
    <SidePanelEmpty
      title={t('error', 'Unable to load record')}
      description={t('record-load-error', 'Please close the panel and try again.')}
      onBack={onBack}
      onClose={onClose}
    />
  ) : (
    <SidePanelEmpty
      title={t('not-found-title', 'Nothing here')}
      description={t('record-not-found', 'This record no longer exists.')}
      onBack={onBack}
      onClose={onClose}
    />
  );
};

/** A saved customer or company: header, then Detail / Properties (/ Description) tabs. */
export const SidePanelSavedRecord = ({ record, onBack, onClose }: IRecordViewProps) => {
  const expanded = usePanelExpanded();
  const { tab: selectedTab, setTab } = useSidePanel();
  const { title, avatar, website, customer, company, state } = useRecordHeading(record);
  const contactType = record.contentType === 'core:company' ? 'core:company' : 'core:customer';
  const contact = customer ?? company;

  const tabs = useContactTabs({
    contentType: contactType,
    contentId: record.contentId,
    description: contact ? contact.description || '' : undefined,
  });

  if (state) return <SidePanelFailed state={state} onBack={onBack} onClose={onClose} />;

  let editableTitle: ReactNode = title;

  if (customer) editableTitle = <CustomerPanelName customer={customer} />;

  if (company) editableTitle = <CompanyPanelName company={company} />;

  const tab =
    selectedTab && tabs.some((entry) => entry.value === selectedTab) ? selectedTab : DETAIL_TAB;

  const actions = (
    <>
      <LeadHeaderActions
        recordType={contactType === 'core:company' ? 'company' : 'customer'}
        record={contact}
      />
      <ContactPanelActions
        contentType={contactType}
        contentId={record.contentId}
        state={contact?.state}
      />
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
        overviewHeader={
          <ContactPanelIdentity title={editableTitle} avatar={avatar} website={website} />
        }
        expandedDefaultTab={PROPERTIES_TAB}
      />
    </>
  );
};

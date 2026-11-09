import { buildRecordPanelTabs } from '@/side-panel/components/recordPanelTabs';
import { ContactDetailHeader } from '@/side-panel/components/details/ContactDetailHeader';
import { ContactPanelDescription } from '@/side-panel/components/details/ContactPanelDescription';
import { useContactPanelOverview } from '@/side-panel/hooks/useContactPanelOverview';
import { useRecordRelationTabs } from '@/side-panel/hooks/useRecordRelationTabs';
import {
  getContactDetailPath,
  isContactContentType,
} from '@/contacts/utils/contactDetailPath';
import { IconLayoutSidebarRight, IconVariable } from '@tabler/icons-react';
import {
  Avatar,
  Empty,
  readImage,
  ScrollArea,
  Skeleton,
  useQueryState,
} from 'erxes-ui';
import { useAtom, useAtomValue } from 'jotai';
import { lazy, Suspense, useState, useRef, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { SidePanelRecordStack } from '@/side-panel/components/SidePanelRecordStack';
import { ContactPanelPermission } from '@/side-panel/components/ContactPanelPermission';
import {
  ContactPanelActions,
  ContactPanelIdentity,
  ContactPanelWebsiteLink,
} from '@/side-panel/components/details/ContactPanelActions';
import {
  isModulePanelPath,
  modulePanelEntriesState,
} from '@/side-panel/states/modulePanelState';
import { CompanyPanelDetail } from '@/side-panel/components/details/CompanyPanelDetail';
import { CompanyPanelProperties } from '@/side-panel/components/details/CompanyPanelProperties';
import { CompanyPanelNew } from '@/side-panel/components/details/CompanyPanelNew';
import { CustomerPanelDetail } from '@/side-panel/components/details/CustomerPanelDetail';
import { DataExtensionsDetailSection } from '@/side-panel/components/details/DataExtensionsDetailSection';
import { CompanyPanelName } from '@/side-panel/components/details/CompanyPanelName';
import { CustomerPanelName } from '@/side-panel/components/details/CustomerPanelName';
import {
  CompanyPanelAvatar,
  CustomerPanelAvatar,
} from '@/side-panel/components/details/ContactPanelAvatar';
import { CustomerPanelNew } from '@/side-panel/components/details/CustomerPanelNew';
import { CustomerPanelProperties } from '@/side-panel/components/details/CustomerPanelProperties';
import { PluginRecordPanel } from '@/side-panel/components/PluginRecordPanel';
import { useRecordPanelPlugin } from '@/side-panel/hooks/useRecordPanelPlugin';
import { MemberDetail } from '@/settings/team-member/details/components/MemberDetail';
import { PRODUCT_CONTENT_TYPE } from '@/products/constants/productQueryKey';
import { ProductsPath } from '@/types/paths/ProductsPath';
import {
  TeamMembersPath,
  USER_CONTENT_TYPE,
} from '@/settings/team-member/constants/teamMemberRoutes';
import {
  DataExtensionRecordFields,
  IRecordSidePanelTab,
  NEW_RECORD_ID,
  RecordSidePanel,
  SIDE_PANEL_CHAT_PATH,
  SIDE_PANEL_ROOT_PATH,
  sidePanelWidthState,
  usePanelExpanded,
  useCompanyDetail,
  useCustomerDetail,
  useDataExtensionRecordName,
  useDataExtensionRecordTypes,
  usePermissionCheck,
  useSidePanel,
  ICompany,
  ICustomerDetail,
  TRelationEntity,
} from 'ui-modules';
const DETAIL_TAB = 'detail';
const DATA_EXTENSIONS_TAB = 'data-extensions';
const ACTIVITY_TAB = 'activity';
const ApprovalRequestRecordPanel = lazy(() =>
  import('@/settings/approval/components/ApprovalRequestRecordPanel').then(
    (module) => ({
      default: module.ApprovalRequestRecordPanel,
    }),
  ),
);
const ProductRecordPanel = lazy(() =>
  import('@/products/product-detail/components/panel/ProductRecordPanel').then(
    (module) => ({
      default: module.ProductRecordPanel,
    }),
  ),
);
const CPUserRecordPanel = lazy(() =>
  import(
    '@/contacts/client-portal-users/cp-user-detail/components/CPUserRecordPanel'
  ).then((module) => ({
    default: module.CPUserRecordPanel,
  })),
);

// The record's own views, for the types core knows how to show. `extra`
// is drawn under the record's own fields in the Detail tab.
const getRecordViews = (
  { contentType, contentId }: TRelationEntity,
  extra?: ReactNode,
) => {
  if (contentType === 'core:customer') {
    return {
      detail: (
        <CustomerPanelDetail customerId={contentId}>
          {extra}
        </CustomerPanelDetail>
      ),
      properties: <CustomerPanelProperties customerId={contentId} />,
    };
  }
  if (contentType === 'core:company') {
    return {
      detail: (
        <CompanyPanelDetail companyId={contentId}>{extra}</CompanyPanelDetail>
      ),
      properties: <CompanyPanelProperties companyId={contentId} />,
    };
  }
  return null;
};

// A plugin's record: its own detail and properties views.
const getPluginRecordViews = (
  { contentType, contentId }: TRelationEntity,
  pluginName: string | null,
  hasProperties: boolean,
) =>
  pluginName
    ? {
        detail: (
          <PluginRecordPanel
            pluginName={pluginName}
            contentType={contentType}
            contentId={contentId}
            view="detail"
          />
        ),
        properties: hasProperties ? (
          <PluginRecordPanel
            pluginName={pluginName}
            contentType={contentType}
            contentId={contentId}
            view="properties"
          />
        ) : null,
      }
    : null;

/** Displays the contact avatar or its initials when no image is available. */
const RecordAvatar = ({ src, name }: { src?: string; name?: string }) => (
  <Avatar size="lg" className="size-7 flex-none">
    <Avatar.Image src={readImage(src)} />
    <Avatar.Fallback>{name?.charAt(0)}</Avatar.Fallback>
  </Avatar>
);

// The name and avatar the panel header shows for the open record.
// `sales:deal` reads as "Deal" until a type has a heading of its own.
const getContentTypeLabel = (contentType: string) => {
  const name = contentType.split(':').pop() || contentType;
  return name.charAt(0).toUpperCase() + name.slice(1);
};

/** Resolves contact identity or delegates a plugin record heading to its owner. */
const useRecordHeading = (
  { contentType, contentId }: TRelationEntity,
  pluginName: string | null,
): {
  title: ReactNode;
  avatar?: ReactNode;
  email?: string;
  website?: string;
  customer?: ICustomerDetail;
  company?: ICompany;
  state?: 'error' | 'not-found';
} => {
  const { t } = useTranslation('common', {
    keyPrefix: 'side-panel',
  });
  // A record just created has no name yet.
  const untitled = t('untitled', 'Untitled');
  const isCustomer = contentType === 'core:customer';
  const isCompany = contentType === 'core:company';
  const {
    customerDetail,
    loading: customerLoading,
    error: customerError,
  } = useCustomerDetail({
    variables: {
      _id: contentId,
    },
    skip: !isCustomer,
  });
  const {
    companyDetail,
    loading: companyLoading,
    error: companyError,
  } = useCompanyDetail(
    {
      variables: {
        _id: contentId,
      },
      skip: !isCompany,
    },
    true,
  );
  // A custom object's record, opened from a link: titled by its name.
  const { recordTypes } = useDataExtensionRecordTypes();
  const customType = contentType.startsWith('custom:')
    ? recordTypes.find((recordType) => recordType.recordType === contentType)
    : undefined;
  const { name: customName } = useDataExtensionRecordName(
    customType,
    contentId,
  );
  if (isCustomer && customerDetail) {
    const { firstName, lastName, primaryEmail, primaryPhone, avatar } =
      customerDetail;
    const title =
      [firstName, lastName].filter(Boolean).join(' ') ||
      primaryEmail ||
      primaryPhone ||
      untitled;
    return {
      title,
      avatar: <RecordAvatar src={avatar} name={title} />,
      email: primaryEmail,
      customer: customerDetail,
    };
  }
  if (isCompany && companyDetail) {
    const { primaryName, avatar } = companyDetail;
    const title = primaryName || untitled;
    return {
      title,
      avatar: <RecordAvatar src={avatar} name={title} />,
      email: companyDetail.primaryEmail,
      website: companyDetail.website,
      company: companyDetail,
    };
  }
  const isContact = isCustomer || isCompany;
  const loading = isCustomer ? customerLoading : companyLoading;
  const error = isCustomer ? customerError : companyError;
  if (isContact && loading) {
    // Still loading: placeholders, never the raw content type.
    return {
      title: <Skeleton className="h-4 w-32" />,
      avatar: <Skeleton className="size-7 flex-none rounded-full" />,
    };
  }
  if (isContact) {
    return {
      title: error
        ? t('error', 'Unable to load record')
        : t('not-found-title', 'Nothing here'),
      state: error ? 'error' : 'not-found',
    };
  }

  // A plugin's record is titled by the plugin.
  if (pluginName) {
    return {
      title: (
        <PluginRecordPanel
          pluginName={pluginName}
          contentType={contentType}
          contentId={contentId}
          view="title"
          quiet
        />
      ),
      avatar: undefined,
    };
  }
  if (customType) {
    return {
      title: customName || <Skeleton className="h-4 w-32" />,
      avatar: undefined,
    };
  }
  return {
    title: getContentTypeLabel(contentType),
    avatar: undefined,
  };
};

/** Explains empty and failed records without mounting their editors. */
const SidePanelEmptyHeader = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <Empty.Header>
    <Empty.Media variant="icon">
      <IconLayoutSidebarRight />
    </Empty.Media>
    <Empty.Title>{title}</Empty.Title>
    <Empty.Description>{description}</Empty.Description>
  </Empty.Header>
);

/** Keeps unavailable records inside the same panel navigation frame. */
const SidePanelEmpty = ({
  title,
  description,
  onBack,
  onClose,
}: {
  title: string;
  description: string;
  onBack?: () => void;
  onClose: () => void;
}) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'side-panel',
  });
  return (
    <>
      <RecordSidePanel.Header
        title={t('title', 'Side panel')}
        onBack={onBack}
        onClose={onClose}
      />
      <div className="flex flex-1 items-center justify-center p-6">
        <Empty>
          <SidePanelEmptyHeader title={title} description={description} />
        </Empty>
      </div>
    </>
  );
};

/** Composes saved record views, contact actions, related modules, and activity. */
const SidePanelSavedRecord = ({
  record,
  onBack,
  onClose,
}: {
  record: TRelationEntity;
  onBack?: () => void;
  onClose: () => void;
}) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'side-panel',
  });
  // Data Extension fields of any record type registered for this content
  // type, the same for core and plugin records: a group of the Detail tab.
  const { t: tDataExtensions } = useTranslation('dataExtensions');
  const { recordTypes } = useDataExtensionRecordTypes();
  const hasDataExtensions = recordTypes.some(
    (recordType) =>
      recordType.fieldCount &&
      recordType.contentTypes.includes(record.contentType),
  );
  const extensionSection = hasDataExtensions ? (
    <DataExtensionsDetailSection
      contentType={record.contentType}
      recordId={record.contentId}
    />
  ) : null;
  const coreViews = getRecordViews(record, extensionSection);
  const { hasActionPermission } = usePermissionCheck();
  const access =
    coreViews && !hasActionPermission('contactsUpdate') ? 'read' : 'write';
  // Types core has no views for may be drawn by the plugin owning them.
  const {
    pluginName,
    i18nNamespace,
    hasProperties,
    tabs: pluginTabs,
  } = useRecordPanelPlugin(record.contentType);
  const panelPluginName = coreViews ? null : pluginName;
  const { t: pluginT } = useTranslation(
    (panelPluginName && i18nNamespace) || undefined,
    { useSuspense: false },
  );
  const expanded = usePanelExpanded();
  const { title, avatar, state, email, website, customer, company } =
    useRecordHeading(record, panelPluginName);
  const canEdit = access === 'write';
  let editableTitle = title;
  let editableAvatar = avatar;
  if (canEdit && customer) {
    editableTitle = <CustomerPanelName customer={customer} />;
    editableAvatar = (
      <CustomerPanelAvatar customer={customer}>{avatar}</CustomerPanelAvatar>
    );
  } else if (canEdit && company) {
    editableTitle = <CompanyPanelName company={company} />;
    editableAvatar = (
      <CompanyPanelAvatar company={company}>{avatar}</CompanyPanelAvatar>
    );
  }
  const pluginViews = coreViews
    ? null
    : getPluginRecordViews(record, panelPluginName, hasProperties);
  // A plugin draws its own detail; the custom fields follow it.
  const views =
    coreViews ||
    (pluginViews && extensionSection
      ? {
          ...pluginViews,
          detail: (
            <ScrollArea
              className="flex-1 min-h-0"
              viewportClassName="[&>div]:block!"
            >
              {pluginViews.detail}
              {extensionSection}
            </ScrollArea>
          ),
        }
      : pluginViews);
  const relationTabs = useRecordRelationTabs({
    record,
    access,
    hasCoreViews: Boolean(coreViews),
    isPluginRecord: Boolean(panelPluginName),
  });
  const overview = useContactPanelOverview(record.contentType, relationTabs);
  const { contactType } = overview;
  const { tab: selectedTab, setTab } = useSidePanel();
  const activityRef = useRef<HTMLDivElement>(null);
  const [noteFocusRequest, setNoteFocusRequest] = useState(0);
  useEffect(() => {
    if (!noteFocusRequest) return undefined;
    const frame = requestAnimationFrame(() =>
      activityRef.current
        ?.querySelector<HTMLElement>('[contenteditable="true"]')
        ?.focus(),
    );
    return () => cancelAnimationFrame(frame);
  }, [noteFocusRequest]);
  // A record without a Detail tab keeps its custom fields in a tab.
  const dataExtensionsTabs: IRecordSidePanelTab[] =
    hasDataExtensions && !views
      ? [
          {
            value: DATA_EXTENSIONS_TAB,
            label: tDataExtensions('section.title'),
            icon: IconVariable,
            content: (
              <div className="flex flex-col flex-1 min-h-0">
                <ScrollArea className="flex-1 min-h-0">
                  <DataExtensionRecordFields
                    contentType={record.contentType}
                    recordId={record.contentId}
                    hideRecordTypeLabels
                    className="p-4"
                  />
                </ScrollArea>
              </div>
            ),
          },
        ]
      : [];
  const recordTabs = buildRecordPanelTabs({
    record,
    views: views && {
      ...views,
      description: contactType && (
        <ContactPanelDescription
          contentType={contactType}
          contentId={record.contentId}
          value={customer?.description || company?.description || ''}
          loading={!customer && !company}
          readonly={!canEdit}
        />
      ),
    },
    expanded,
    pluginName: panelPluginName,
    pluginTabs: pluginTabs.map((pluginTab) => ({
      ...pluginTab,
      label: pluginTab.labelKey
        ? pluginT(pluginTab.labelKey, { defaultValue: pluginTab.label })
        : pluginTab.label,
    })),
    overview,
    access,
    noteRef: activityRef,
    labels: {
      detail: t('detail', 'Detail'),
      properties: t('properties', 'Properties'),
      description: t('description', 'Description'),
      messages: t('conversations', 'Conversations'),
      relations: t('relations', 'Relations'),
      activity: t('activity', 'Activity'),
    },
  });
  const tabs = [...dataExtensionsTabs, ...recordTabs];
  if (state) {
    return (
      <SidePanelEmpty
        title={
          state === 'error'
            ? t('error', 'Unable to load record')
            : t('not-found-title', 'Nothing here')
        }
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
  const tab =
    selectedTab && tabs.some((entry) => entry.value === selectedTab)
      ? selectedTab
      : views
      ? DETAIL_TAB
      : hasDataExtensions
      ? DATA_EXTENSIONS_TAB
      : ACTIVITY_TAB;
  const contactActions = contactType && (
    <ContactPanelActions
      contentType={contactType}
      contentId={record.contentId}
      email={email}
      onMessage={
        overview.allEntries.some(
          (entry) => entry.key === 'frontline.conversation',
        )
          ? () => {
              setTab(
                tabs.find(
                  (entry) =>
                    entry.value === 'messages' ||
                    entry.value === 'module:frontline.conversation',
                )?.value || 'relations',
              );
            }
          : undefined
      }
      onNote={() => {
        setTab(ACTIVITY_TAB);
        setNoteFocusRequest((value) => value + 1);
      }}
    />
  );
  return (
    <>
      {contactType && expanded ? (
        <ContactDetailHeader
          contentType={contactType}
          title={title}
          actions={contactActions}
        />
      ) : (
        <RecordSidePanel.Header
          avatar={editableAvatar}
          title={editableTitle}
          actions={
            contactActions ? (
              <>
                <ContactPanelWebsiteLink website={website} />
                {contactActions}
              </>
            ) : (
              panelPluginName && (
                <PluginRecordPanel
                  pluginName={panelPluginName}
                  contentType={record.contentType}
                  contentId={record.contentId}
                  view="actions"
                  quiet
                />
              )
            )
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
        overviewTab={contactType ? DETAIL_TAB : undefined}
        overviewHeader={
          contactType && (
            <ContactPanelIdentity
              title={editableTitle}
              avatar={editableAvatar}
              website={website}
            />
          )
        }
        expandedDefaultTab={ACTIVITY_TAB}
      />
    </>
  );
};

// A record not created yet: its draft, saved as the record on its first
// value (see `NEW_RECORD_ID`).
const SidePanelDraft = ({
  record,
  onBack,
  onClose,
}: {
  record: TRelationEntity;
  onBack?: () => void;
  onClose: () => void;
}) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'side-panel',
  });
  const { pluginName, hasDraftTitle } = useRecordPanelPlugin(
    record.contentType,
  );
  const { hasActionPermission } = usePermissionCheck();
  /** Selects the authorized contact or plugin draft editor. */
  const renderDraft = () => {
    if (
      ['core:customer', 'core:company'].includes(record.contentType) &&
      !hasActionPermission('contactsCreate')
    ) {
      return <div className="p-4">{t('access-denied', 'Access denied')}</div>;
    }
    if (record.contentType === 'core:customer') {
      return <CustomerPanelNew />;
    }
    if (record.contentType === 'core:company') {
      return <CompanyPanelNew />;
    }
    return (
      pluginName && (
        <PluginRecordPanel
          pluginName={pluginName}
          contentType={record.contentType}
          contentId={record.contentId}
          view="new"
        />
      )
    );
  };
  return (
    <>
      <RecordSidePanel.Header
        title={
          pluginName && hasDraftTitle ? (
            <PluginRecordPanel
              pluginName={pluginName}
              contentType={record.contentType}
              contentId={record.contentId}
              view="title"
              quiet
            />
          ) : (
            t('new-record', 'New {{type}}', {
              type: getContentTypeLabel(record.contentType).toLowerCase(),
            })
          )
        }
        onBack={onBack}
        onClose={onClose}
      />
      <div className="flex flex-1 min-h-0 flex-col">{renderDraft()}</div>
    </>
  );
};

// A record as the side panel shows it, or its draft; also given to
// `RecordViewContext` so it can be drawn where the panel cannot reach.
export const SidePanelRecord = (
  props: React.ComponentProps<typeof SidePanelSavedRecord>,
) => {
  if (['core:customer', 'core:company'].includes(props.record.contentType)) {
    return (
      <ContactPanelPermission
        creating={props.record.contentId === NEW_RECORD_ID}
      >
        {props.record.contentId === NEW_RECORD_ID ? (
          <SidePanelDraft {...props} />
        ) : (
          <SidePanelSavedRecord {...props} />
        )}
      </ContactPanelPermission>
    );
  }
  if (props.record.contentType === 'core:cpUser')
    return (
      <Suspense fallback={<Skeleton className="m-3 h-32" />}>
        <CPUserRecordPanel {...props} />
      </Suspense>
    );
  if (props.record.contentType === PRODUCT_CONTENT_TYPE) {
    return (
      <Suspense fallback={<Skeleton className="m-3 h-32" />}>
        <ProductRecordPanel {...props} />
      </Suspense>
    );
  }
  if (props.record.contentType === 'core:approvalRequest') {
    return (
      <Suspense fallback={<Skeleton className="m-3 h-32" />}>
        <ApprovalRequestRecordPanel {...props} />
      </Suspense>
    );
  }
  if (props.record.contentType === USER_CONTENT_TYPE) {
    return <MemberDetail onBack={props.onBack} onClose={props.onClose} />;
  }
  return props.record.contentId === NEW_RECORD_ID ? (
    <SidePanelDraft {...props} />
  ) : (
    <SidePanelSavedRecord {...props} />
  );
};

/**
 * The app-wide side panel: a column below the top bar, right of every app. What
 * it shows is its own route, kept in the `panel` query param
 * (`?panel=/detail/customer/<id>`), so it can be linked and reloaded.
 */
export const SidePanelLayout = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'side-panel',
  });
  const { open, path, history, record, close, canGoBack, back } =
    useSidePanel();
  const onBack = canGoBack ? back : undefined;
  const [width, setWidth] = useAtom(sidePanelWidthState);
  const [expanded, setExpanded] = useQueryState<boolean>('panelExpanded');
  const [moduleWidths, setModuleWidths] = useState<Record<string, number>>({});
  const moduleEntries = useAtomValue(modulePanelEntriesState);
  const moduleEntry = path ? moduleEntries[path] : undefined;
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { detailPath } = useRecordPanelPlugin(record?.contentType ?? '');
  // Records with detail routes expand into their own pages.
  const getRecordPage = () => {
    if (!record || record.contentId === NEW_RECORD_ID) return null;
    if (isContactContentType(record.contentType)) {
      return getContactDetailPath(
        record.contentType,
        record.contentId,
        pathname,
      );
    }
    if (record.contentType === PRODUCT_CONTENT_TYPE) {
      return `${ProductsPath.Products}/${encodeURIComponent(record.contentId)}`;
    }
    if (record.contentType === USER_CONTENT_TYPE) {
      return `${TeamMembersPath.Index}${
        TeamMembersPath.TeamMembers
      }/${encodeURIComponent(record.contentId)}`;
    }
    return detailPath
      ? detailPath(encodeURIComponent(record.contentId), pathname)
      : null;
  };
  const recordPage = getRecordPage();
  const coreDraft =
    record?.contentType.startsWith('core:') &&
    record.contentId === NEW_RECORD_ID;
  const expandable =
    !coreDraft &&
    Boolean(
      recordPage ||
        (moduleEntry?.expandable && moduleEntry.onExpand),
    );

  useEffect(() => {
    if (open && expanded && moduleEntry?.onExpand) {
      moduleEntry.onExpand();
      return;
    }
    if (open && expanded && !expandable && (record || moduleEntry)) {
      setExpanded(null, { replace: true });
    }
  }, [open, expanded, expandable, record, moduleEntry, setExpanded]);

  /** Selects a retained record stack or a recoverable empty state. */
  const renderRoute = () => {
    if (record || isModulePanelPath(path)) {
      return (
        <SidePanelRecordStack
          path={path || ''}
          history={history}
          View={SidePanelRecord}
          onBack={onBack}
          onClose={close}
        />
      );
    }
    if (path === SIDE_PANEL_ROOT_PATH) {
      return (
        <SidePanelEmpty
          title={t('empty-title', 'Nothing open')}
          description={t(
            'empty-description',
            'Open a record to see it and everything related to it here.',
          )}
          onClose={close}
        />
      );
    }
    return (
      <SidePanelEmpty
        title={t('not-found-title', 'Nothing here')}
        description={t(
          'not-found-description',
          'This panel link does not point to a record.',
        )}
        onClose={close}
      />
    );
  };
  return (
    <>
      {/* Links saved while records still expanded in place. */}
      {recordPage && expanded && <Navigate to={recordPage} replace />}
      {/* `/chat` is handed to the global sidebar; never render it here. */}
      {open && path !== SIDE_PANEL_CHAT_PATH && !(recordPage && expanded) && (
        <RecordSidePanel
          key="record"
          expanded={false}
          expandable={expandable}
          onExpandedChange={() => {
            if (recordPage) {
              navigate(recordPage);
            } else {
              moduleEntry?.onExpand?.();
            }
          }}
          width={
            moduleEntry && path
              ? moduleWidths[path] ??
                Math.max(width, moduleEntry.defaultWidth || 0)
              : width
          }
          maxWidth={moduleEntry?.maxWidth}
          onWidthChange={
            moduleEntry && path
              ? (nextWidth) =>
                  setModuleWidths((previous) => ({
                    ...previous,
                    [path]: nextWidth,
                  }))
              : setWidth
          }
        >
          {renderRoute()}
        </RecordSidePanel>
      )}
    </>
  );
};

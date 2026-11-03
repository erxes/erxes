import { buildRecordPanelTabs } from '@/side-panel/components/recordPanelTabs';
import { ContactPanelBreadcrumb } from '@/side-panel/components/details/ContactPanelBreadcrumb';
import { useContactPanelOverview } from '@/side-panel/hooks/useContactPanelOverview';
import { RecordPagePortal } from '@/side-panel/components/RecordPageSlot';
import { IconLayoutSidebarRight } from '@tabler/icons-react';
import { Avatar, Empty, readImage, Skeleton, useQueryState } from 'erxes-ui';
import { useAtom, useAtomValue } from 'jotai';
import { ReactNode, useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AssistantPanel } from '@/side-panel/components/chat/AssistantPanel';
import { SidePanelRecordStack } from '@/side-panel/components/SidePanelRecordStack';
import { ContactPanelPermission } from '@/side-panel/components/ContactPanelPermission';
import { ContactPanelActions } from '@/side-panel/components/details/ContactPanelActions';
import {
  isModulePanelPath,
  modulePanelEntriesState,
} from '@/side-panel/states/modulePanelState';
import { CompanyPanelDetail } from '@/side-panel/components/details/CompanyPanelDetail';
import { CompanyPanelProperties } from '@/side-panel/components/details/CompanyPanelProperties';
import { CompanyPanelNew } from '@/side-panel/components/details/CompanyPanelNew';
import { CustomerPanelDetail } from '@/side-panel/components/details/CustomerPanelDetail';
import { CustomerPanelNew } from '@/side-panel/components/details/CustomerPanelNew';
import { CustomerPanelProperties } from '@/side-panel/components/details/CustomerPanelProperties';
import { PluginRecordPanel } from '@/side-panel/components/PluginRecordPanel';
import { useRecordPanelPlugin } from '@/side-panel/hooks/useRecordPanelPlugin';
import { MemberDetail } from '@/settings/team-member/details/components/MemberDetail';
import { USER_CONTENT_TYPE } from '@/settings/team-member/constants/teamMemberRoutes';
import {
  NEW_RECORD_ID,
  RecordSidePanel,
  SIDE_PANEL_CHAT_PATH,
  SIDE_PANEL_ROOT_PATH,
  sidePanelWidthState,
  TRelationEntity,
  usePanelExpanded,
  useCompanyDetail,
  useCustomerDetail,
  useRelationWidgetTabs,
  usePermissionCheck,
  useSidePanel,
} from 'ui-modules';

const DETAIL_TAB = 'detail';
const ACTIVITY_TAB = 'activity';

// The record's own views, for the types core knows how to show.
const getRecordViews = ({ contentType, contentId }: TRelationEntity) => {
  if (contentType === 'core:customer') {
    return {
      detail: <CustomerPanelDetail customerId={contentId} />,
      properties: <CustomerPanelProperties customerId={contentId} />,
    };
  }

  if (contentType === 'core:company') {
    return {
      detail: <CompanyPanelDetail companyId={contentId} />,
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
  state?: 'error' | 'not-found';
} => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  // A record just created has no name yet.
  const untitled = t('untitled', 'Untitled');
  const isCustomer = contentType === 'core:customer';
  const isCompany = contentType === 'core:company';

  const {
    customerDetail,
    loading: customerLoading,
    error: customerError,
  } = useCustomerDetail({
    variables: { _id: contentId },
    skip: !isCustomer,
  });
  const {
    companyDetail,
    loading: companyLoading,
    error: companyError,
  } = useCompanyDetail(
    { variables: { _id: contentId }, skip: !isCompany },
    true,
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

  return { title: getContentTypeLabel(contentType), avatar: undefined };
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
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });

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
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  const coreViews = getRecordViews(record);
  const { hasActionPermission } = usePermissionCheck();
  const access =
    coreViews && !hasActionPermission('contactsUpdate') ? 'read' : 'write';
  // Types core has no views for may be drawn by the plugin owning them.
  const { pluginName, hasProperties } = useRecordPanelPlugin(
    record.contentType,
  );
  const panelPluginName = coreViews ? null : pluginName;
  const expanded = usePanelExpanded();
  const { title, avatar, state, email, website } = useRecordHeading(
    record,
    panelPluginName,
  );
  const views =
    coreViews || getPluginRecordViews(record, panelPluginName, hasProperties);
  const relationTabs = useRelationWidgetTabs({
    ...record,
    access,
    // Linked customers and companies are in a contact's Detail tab already.
    hiddenModules: coreViews ? ['customer', 'company'] : [],
    // A plugin's record keeps its customers and companies in its detail,
    // and everything else links through them: it has no Relations tab.
    skip: Boolean(panelPluginName),
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
  const tabs = buildRecordPanelTabs({
    record,
    views,
    pluginName: panelPluginName,
    overview,
    access,
    noteRef: activityRef,
    labels: {
      detail: t('detail', 'Detail'),
      properties: t('properties', 'Properties'),
      messages: t('messages', 'Messages'),
      relations: t('relations', 'Relations'),
      activity: t('activity', 'Activity'),
    },
  });

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
      : ACTIVITY_TAB;

  return (
    <>
      <RecordSidePanel.Header
        avatar={contactType ? undefined : avatar}
        title={
          contactType && expanded ? (
            <ContactPanelBreadcrumb contentType={contactType} title={title} />
          ) : (
            title
          )
        }
        actions={
          panelPluginName && (
            <PluginRecordPanel
              pluginName={panelPluginName}
              contentType={record.contentType}
              contentId={record.contentId}
              view="actions"
              quiet
            />
          )
        }
        onBack={onBack}
        onClose={onClose}
      />
      {contactType && (
        <ContactPanelActions
          contentType={contactType}
          contentId={record.contentId}
          email={email}
          website={website}
          title={title}
          avatar={avatar}
          onMessage={
            tabs.some((entry) => entry.value === 'messages')
              ? () => setTab('messages')
              : undefined
          }
          onNote={() => {
            setTab(ACTIVITY_TAB);
            setNoteFocusRequest((value) => value + 1);
          }}
        />
      )}
      <RecordSidePanel.Tabs
        tabs={tabs}
        value={tab}
        onValueChange={setTab}
        visibleCount={8}
        overviewTab={contactType ? DETAIL_TAB : undefined}
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
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
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
 * The app-wide side panel: a full-height column right of every app. What it
 * shows is its own route, kept in the `panel` query param
 * (`?panel=/detail/customer/<id>`), so it can be linked and reloaded.
 */
export const SidePanelLayout = () => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  const { open, path, history, record, close, canGoBack, back } =
    useSidePanel();
  const onBack = canGoBack ? back : undefined;
  const [width, setWidth] = useAtom(sidePanelWidthState);
  const [expanded, setExpanded] = useQueryState<boolean>('panelExpanded');
  const [moduleWidths, setModuleWidths] = useState<Record<string, number>>({});
  const moduleEntries = useAtomValue(modulePanelEntriesState);
  const moduleEntry = path ? moduleEntries[path] : undefined;
  const pageExpanded = Boolean(
    expanded &&
      record &&
      ['core:customer', 'core:company'].includes(record.contentType),
  );

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
      {open && path !== SIDE_PANEL_CHAT_PATH && (
        <RecordPagePortal active={pageExpanded}>
          <RecordSidePanel
            key="record"
            expandedMode={pageExpanded ? 'page' : 'viewport'}
            expanded={Boolean(expanded)}
            onExpandedChange={setExpanded}
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
        </RecordPagePortal>
      )}
      <AssistantPanel />
    </>
  );
};

import {
  IconHierarchy2,
  IconHistory,
  IconId,
  IconLink,
  IconLayoutSidebarRight,
} from '@tabler/icons-react';
import { Avatar, Empty, readImage, ScrollArea, Skeleton } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { companyCustomActivities } from '@/contacts/companies/company-detail/CompanyActivityRows';
import { AssistantPanel } from './chat/AssistantPanel';
import { ContactOverview } from './relations/ContactOverview';
import {
  buildContactOverviewEntries,
  TContactOverviewEntry,
} from './relations/contactOverviewEntries';
import { contactOverviewLayoutState } from '@/side-panel/states/contactOverviewState';
import { RenderPluginsComponent } from '~/plugins/components/RenderPluginsComponent';
import { SidePanelRelations } from './relations/SidePanelRelations';
import { useContactWidgetModules } from '@/side-panel/hooks/useContactWidgetModules';
import { CompanyPanelDetail } from './details/CompanyPanelDetail';
import { CompanyPanelProperties } from './details/CompanyPanelProperties';
import { CompanyPanelNew } from './details/CompanyPanelNew';
import { CustomerPanelDetail } from './details/CustomerPanelDetail';
import { CustomerPanelNew } from './details/CustomerPanelNew';
import { CustomerPanelProperties } from './details/CustomerPanelProperties';
import { PluginRecordPanel } from './PluginRecordPanel';
import { useRecordPanelPlugin } from '@/side-panel/hooks/useRecordPanelPlugin';
import {
  ActivityLogs,
  AddInternalNote,
  IRecordSidePanelTab,
  NEW_RECORD_ID,
  RecordSidePanel,
  SIDE_PANEL_CHAT_PATH,
  SIDE_PANEL_ROOT_PATH,
  sidePanelWidthState,
  TRelationEntity,
  useCompanyDetail,
  useCustomerDetail,
  useRelationWidgetTabs,
  useSidePanel,
} from 'ui-modules';

const DETAIL_TAB = 'detail';
const PROPERTIES_TAB = 'properties';
const RELATIONS_TAB = 'relations';
const ACTIVITY_TAB = 'activity';

// The record's own views, for the types core knows how to show.
const getRecordViews = ({ contentType, contentId }: TRelationEntity) => {
  if (contentType === 'core:customer') {
    return {
      detail: (
<CustomerPanelDetail customerId={contentId} />
      ),
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

const useRecordHeading = (
  { contentType, contentId }: TRelationEntity,
  pluginName: string | null,
) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  // A record just created has no name yet.
  const untitled = t('untitled', 'Untitled');
  const isCustomer = contentType === 'core:customer';
  const isCompany = contentType === 'core:company';

  const { customerDetail } = useCustomerDetail({
    variables: { _id: contentId },
    skip: !isCustomer,
  });
  const { companyDetail } = useCompanyDetail(
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

    return { title, avatar: <RecordAvatar src={avatar} name={title} /> };
  }

  if (isCompany && companyDetail) {
    const { primaryName, avatar } = companyDetail;

    const title = primaryName || untitled;

    return {
      title,
      avatar: <RecordAvatar src={avatar} name={title} />,
    };
  }

  // Still loading: placeholders, never the raw content type.
  if (isCustomer || isCompany) {
    return {
      title: <Skeleton className="h-4 w-32" />,
      avatar: <Skeleton className="size-7 flex-none rounded-full" />,
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

// A module pinned as its own tab: the plugin's section on its own (it then
// manages itself), or a module's relation widget.
const PinnedModuleTab = ({
  entry,
  contactType,
  contentId,
  onUnavailable,
}: {
  entry: TContactOverviewEntry;
  contactType: 'core:customer' | 'core:company';
  contentId: string;
  onUnavailable: (moduleKey: string) => void;
}) =>
  entry.kind === 'section' ? (
    <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
      <RenderPluginsComponent
        pluginName={`${entry.module.pluginName}_ui`}
        remoteModuleName="contactWidget"
        props={{
          module: entry.module.name,
          contentType: contactType,
          contentId,
        }}
        onLoadError={() => onUnavailable(entry.key)}
      />
    </ScrollArea>
  ) : (
    <div className="flex flex-1 min-h-0 flex-col">{entry.tab.content}</div>
  );

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
  // Types core has no views for may be drawn by the plugin owning them.
  const { pluginName, hasProperties } = useRecordPanelPlugin(
    record.contentType,
  );
  const panelPluginName = coreViews ? null : pluginName;
  const { title, avatar } = useRecordHeading(record, panelPluginName);
  const views = coreViews || getPluginRecordViews(record, panelPluginName, hasProperties);
  const relationTabs = useRelationWidgetTabs({
    ...record,
    // Linked customers and companies are in a contact's Detail tab already.
    hiddenModules: coreViews ? ['customer', 'company'] : [],
    // A plugin's record keeps its customers and companies in its detail,
    // and everything else links through them: it has no Relations tab.
    skip: !!panelPluginName,
  });
  // A contact's relations open as an overview: plugins' sections, then the
  // modules without one under "More".
  const contactType =
    record.contentType === 'core:customer' ||
    record.contentType === 'core:company'
      ? record.contentType
      : null;
  const contactModules = useContactWidgetModules();
  // Sections that failed to load fall back to their relation widget in More.
  const [unavailable, setUnavailable] = useState<string[]>([]);
  const overviewModules = contactType
    ? contactModules.filter(
        (module) =>
          !unavailable.includes(`${module.pluginName}.${module.name}`),
      )
    : [];
  const overviewKeys = new Set(
    overviewModules.map((module) => `${module.pluginName}.${module.name}`),
  );
  const moreTabs = relationTabs.filter((tab) => !overviewKeys.has(tab.value));
  const onUnavailable = (moduleKey: string) =>
    setUnavailable((keys) =>
      keys.includes(moduleKey) ? keys : [...keys, moduleKey],
    );

  // The user's arrangement: module order and modules pinned as tabs.
  const [layouts, setLayouts] = useAtom(contactOverviewLayoutState);
  const layout = (contactType && layouts[contactType]) || {
    order: [],
    tabs: [],
  };
  const allEntries = contactType
    ? buildContactOverviewEntries(overviewModules, moreTabs, layout.order)
    : [];
  const pinned = allEntries.filter((entry) => layout.tabs.includes(entry.key));
  const overviewEntries = allEntries.filter(
    (entry) => !layout.tabs.includes(entry.key),
  );
  const saveLayout = (next: Partial<typeof layout>) =>
    contactType &&
    setLayouts((previous) => ({
      ...previous,
      [contactType]: { ...layout, ...next },
    }));

  const pinnedTabs: IRecordSidePanelTab[] = contactType
    ? pinned.map((entry) => ({
        value: `module:${entry.key}`,
        label: entry.label,
        icon: entry.icon || IconLink,
        content: (
          <PinnedModuleTab
            entry={entry}
            contactType={contactType}
            contentId={record.contentId}
            onUnavailable={onUnavailable}
          />
        ),
      }))
    : [];
  const [tab, setTab] = useState(views ? DETAIL_TAB : ACTIVITY_TAB);

  const tabs: IRecordSidePanelTab[] = [
    ...(views
      ? [
          {
            value: DETAIL_TAB,
            label: t('detail', 'Detail'),
            icon: IconId,
            content: views.detail,
          },
          ...(views.properties
            ? [
                {
                  value: PROPERTIES_TAB,
                  label: t('properties', 'Properties'),
                  icon: IconHierarchy2,
                  content: views.properties,
                },
              ]
            : []),
        ]
      : []),
    ...pinnedTabs,
    ...((contactType ? allEntries.length : moreTabs.length)
      ? [
          {
            value: RELATIONS_TAB,
            label: t('relations', 'Relations'),
            icon: IconLink,
            content: contactType ? (
              <ContactOverview
                contactType={contactType}
                contentId={record.contentId}
                entries={overviewEntries}
                customize={{
                  entries: allEntries,
                  tabs: layout.tabs,
                  onReorder: (order) => saveLayout({ order }),
                  onToggleTab: (key) =>
                    saveLayout({
                      tabs: layout.tabs.includes(key)
                        ? layout.tabs.filter((pinnedKey) => pinnedKey !== key)
                        : [...layout.tabs, key],
                    }),
                }}
                onUnavailable={onUnavailable}
              />
            ) : (
              <SidePanelRelations tabs={moreTabs} />
            ),
          },
        ]
      : []),
    ...[
          {
            value: ACTIVITY_TAB,
            label: t('activity', 'Activity'),
            icon: IconHistory,
            content: panelPluginName ? (
              // A plugin keeps its records' activity (and comments) itself.
              <PluginRecordPanel
                pluginName={panelPluginName}
                contentType={record.contentType}
                contentId={record.contentId}
                view="activity"
              />
            ) : (
              <div className="flex flex-col flex-1 min-h-0">
                {/* The log and note box are spaced for the wide detail sheet; in the
                    panel both sit 16px in, and the log never widens the panel. */}
                <ScrollArea
                  className="flex-1 min-h-0"
                  viewportClassName="[&>div]:block!"
                >
                  <div className="pt-3 [&_.px-6]:px-2">
                    <ActivityLogs
                      targetId={record.contentId}
                      customActivities={
                        record.contentType === 'core:company'
                          ? companyCustomActivities
                          : undefined
                      }
                      variant="backward"
                    />
                  </div>
                </ScrollArea>
                <div className="shrink-0 pb-4 pt-2 [&_.ml-10]:ml-4 [&_.mr-8]:mr-4">
                  <AddInternalNote
                    contentTypeId={record.contentId}
                    contentType={record.contentType}
                  />
                </div>
              </div>
            ),
          },
        ],
  ];

  return (
    <>
      <RecordSidePanel.Header
        avatar={avatar}
        title={title}
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
      <RecordSidePanel.Tabs
        tabs={tabs}
        value={tab}
        onValueChange={setTab}
        visibleCount={8}
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
  const { pluginName } = useRecordPanelPlugin(record.contentType);

  const renderDraft = () => {
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
        title={t('new-record', 'New {{type}}', {
          type: getContentTypeLabel(record.contentType).toLowerCase(),
        })}
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
) =>
  props.record.contentId === NEW_RECORD_ID ? (
    <SidePanelDraft {...props} />
  ) : (
    <SidePanelSavedRecord {...props} />
  );

const SidePanelEmpty = ({
  title,
  description,
  onClose,
}: {
  title: string;
  description: string;
  onClose: () => void;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });

  return (
    <>
      <RecordSidePanel.Header
        title={t('title', 'Side panel')}
        onClose={onClose}
      />
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

/**
 * The app-wide side panel: a full-height column right of every app. What it
 * shows is its own route, kept in the `panel` query param
 * (`?panel=/detail/customer/<id>`), so it can be linked and reloaded.
 */
export const SidePanelLayout = () => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  const { open, path, record, close, canGoBack, back } = useSidePanel();
  const onBack = canGoBack ? back : undefined;
  const [width, setWidth] = useAtom(sidePanelWidthState);

  const renderRoute = () => {
    if (record) {
      return (
        <SidePanelRecord
          key={`${record.contentType}:${record.contentId}`}
          record={record}
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
        <RecordSidePanel key="record" width={width} onWidthChange={setWidth}>
          {renderRoute()}
        </RecordSidePanel>
      )}
      <AssistantPanel />
    </>
  );
};

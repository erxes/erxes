import { IconHierarchy2, IconHistory, IconId } from '@tabler/icons-react';
import { skipToken, useQuery } from '@tanstack/react-query';
import {
  Breadcrumb,
  buttonVariants,
  Spinner,
  type TPanelRecordType,
  type TRecordSlotProps,
  type TRecordTab,
  usePanelExpanded,
} from 'erxes-ui';
import { type ComponentType, type ElementType, type ReactNode, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { SharedTimeline } from '~/modules/activity/SharedTimeline';
import { ContactDetailScroll } from '~/modules/side-panel/details/ContactDetailFields';
import { RecordPageHeader } from '~/modules/side-panel/RecordPageHeader';
import { type IRecordSidePanelTab, RecordSidePanel } from '~/modules/side-panel/RecordSidePanel';
import type { IRecordViewProps } from '~/modules/side-panel/recordView';
import { useCreatedPanelRecord } from '~/modules/side-panel/useCreatedPanelRecord';
import { useSidePanel, useSidePanelDraft } from '~/modules/side-panel/useSidePanel';
import { PluginBoundary } from './PluginBoundary';
import { propertiesOf } from './pluginProperties';
import { PluginRecordProperties } from './PluginRecordProperties';
import { usePluginRelationTabs } from './PluginRelationTabs';
import { pluginName, usePluginText } from './pluginText';
import { tabsShown } from './recordTabs';
import { usePluginRecordType } from './usePluginRecordType';

const DETAIL_TAB = 'detail';
const PROPERTIES_TAB = 'properties';
const ACTIVITY_TAB = 'activity';

/** One of the plugin's slots, kept apart if it crashes; the rest of the panel stays. */
const Slot = ({
  plugin,
  component: Component,
  record,
}: {
  plugin: string;
  component: ComponentType<TRecordSlotProps>;
  record: TRecordSlotProps;
}) => (
  <PluginBoundary name={plugin} compact resetKey={record.contentId}>
    <Suspense fallback={<Spinner size="sm" />}>
      <Component contentType={record.contentType} contentId={record.contentId} />
    </Suspense>
  </PluginBoundary>
);

/** The record's customers and companies, for relation tabs; none when the type gives none. */
const useRecordContacts = (type: TPanelRecordType, contentId: string) => {
  const query = useQuery(
    type.contacts
      ? type.contacts(contentId)
      : { queryKey: ['plugin-record-contacts', type.contentType, contentId], queryFn: skipToken },
  );

  return type.contacts ? query.data : undefined;
};

/**
 * Detail, the type's own tabs, Properties (when it has `properties`), every allowed plugin's
 * relation tabs, then Activity: the order a customer's tabs have. A type's tab
 * `after: 'activity'` goes last, and an `expandedOnly` one shows only on the record's own page.
 */
const useRecordTabs = (
  plugin: string,
  type: TPanelRecordType,
  record: TRecordSlotProps,
): IRecordSidePanelTab[] => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  const contacts = useRecordContacts(type, record.contentId);
  const relationTabs = usePluginRelationTabs({ ...record, contacts });
  const text = usePluginText();
  const own = tabsShown(type.tabs, usePanelExpanded());
  const properties = propertiesOf(plugin, type);

  const ownTab = (tab: TRecordTab): IRecordSidePanelTab => ({
    value: tab.value,
    label: text(plugin, tab.label),
    icon: tab.icon,
    content: (
      <ContactDetailScroll>
        <Slot plugin={plugin} component={tab.component} record={record} />
      </ContactDetailScroll>
    ),
  });

  return [
    {
      value: DETAIL_TAB,
      label: t('detail', 'Detail'),
      icon: IconId,
      content: (
        <ContactDetailScroll>
          <Slot plugin={plugin} component={type.Detail} record={record} />
        </ContactDetailScroll>
      ),
    },
    ...own.filter((tab) => tab.after !== 'activity').map(ownTab),
    ...(properties
      ? [
          {
            value: PROPERTIES_TAB,
            label: t('properties', 'Properties'),
            icon: IconHierarchy2,
            content: <PluginRecordProperties type={properties} contentId={record.contentId} />,
          },
        ]
      : []),
    ...relationTabs,
    ...(type.activity
      ? [
          {
            value: ACTIVITY_TAB,
            label: t('activity', 'Activity'),
            icon: IconHistory,
            content: <SharedTimeline type={type.activity} id={record.contentId} />,
          },
        ]
      : []),
    ...own.filter((tab) => tab.after === 'activity').map(ownTab),
  ];
};

/** A record type's list: its own page's address without the record, else the plugin's first page. */
const listPathOf = (type: TPanelRecordType, contentId: string, base: string) => {
  const page = type.detailPath(contentId);
  const suffix = `/${encodeURIComponent(contentId)}`;

  return page.endsWith(suffix) ? page.slice(0, -suffix.length) || base : base;
};

/** A plugin record's page: the plugin › its type's list › the record's name, as a customer's. */
const PluginRecordBreadcrumb = ({
  plugin,
  base,
  icon: PluginIcon,
  type,
  contentId,
  title,
}: {
  plugin: string;
  base: string;
  icon?: ElementType;
  type: TPanelRecordType;
  contentId: string;
  title: ReactNode;
}) => {
  const text = usePluginText();
  const list = listPathOf(type, contentId, base);

  return (
    <Breadcrumb>
      <Breadcrumb.List>
        <Breadcrumb.Item>
          <Link to={base} className={buttonVariants({ variant: 'ghost' })}>
            {PluginIcon && <PluginIcon aria-hidden="true" />}
            {pluginName(text, plugin)}
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item>
          <Link to={list} className={buttonVariants({ variant: 'ghost' })}>
            <type.icon aria-hidden="true" />
            {text(plugin, type.title)}
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item>
          <Breadcrumb.Page variant="text" className="block max-w-64">
            {title}
          </Breadcrumb.Page>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb>
  );
};

/** A loaded plugin record: core's header and tabs around the plugin's slots. */
const PluginRecordPanel = ({
  plugin,
  base,
  icon,
  type,
  record,
  onBack,
  onClose,
}: IRecordViewProps & {
  plugin: string;
  base: string;
  icon?: ElementType;
  type: TPanelRecordType;
}) => {
  const expanded = usePanelExpanded();
  const { tab: selected, setTab } = useSidePanel();
  const tabs = useRecordTabs(plugin, type, record);
  const title = <Slot plugin={plugin} component={type.Title} record={record} />;
  const actions = type.Actions && <Slot plugin={plugin} component={type.Actions} record={record} />;
  const tab = selected && tabs.some((entry) => entry.value === selected) ? selected : DETAIL_TAB;

  return (
    <>
      {expanded ? (
        <RecordPageHeader
          breadcrumb={
            <PluginRecordBreadcrumb
              plugin={plugin}
              base={base}
              icon={icon}
              type={type}
              contentId={record.contentId}
              title={title}
            />
          }
          actions={actions}
        />
      ) : (
        <RecordSidePanel.Header title={title} actions={actions} onBack={onBack} onClose={onClose} />
      )}
      <RecordSidePanel.Layout
        tabs={tabs}
        value={tab}
        onValueChange={setTab}
        visibleCount={8}
        overviewTab={DETAIL_TAB}
        overviewHeader={<h2 className="min-w-0 flex-1 truncate text-sm font-semibold">{title}</h2>}
        expandedDefaultTab={
          (
            tabs.find((entry) => entry.value === ACTIVITY_TAB) ??
            tabs.find((entry) => entry.value !== DETAIL_TAB)
          )?.value
        }
      />
    </>
  );
};

/**
 * A plugin's saved record in core's side panel, or on its own page. Core draws the panel;
 * the plugin's `Title`, `Actions`, `Detail` and tabs fill it, each kept apart if it crashes.
 */
export const PluginRecordView = (props: IRecordViewProps) => {
  const { entry } = usePluginRecordType(props.record.contentType);

  if (!entry) return null;

  return (
    <PluginRecordPanel
      {...props}
      plugin={entry.plugin}
      base={entry.base}
      icon={entry.icon}
      type={entry.type}
    />
  );
};

/** A plugin record's draft under core's "New …" header: Save puts the record in its place. */
export const PluginRecordNew = ({ contentType }: { contentType: string }) => {
  const { entry } = usePluginRecordType(contentType);
  const defaults = useSidePanelDraft(contentType);
  const onCreated = useCreatedPanelRecord(contentType);
  const { back, canGoBack, close } = useSidePanel();
  const New = entry?.type.New;

  if (!entry || !New) return null;

  return (
    <PluginBoundary name={entry.plugin} resetKey={contentType}>
      <Suspense fallback={<Spinner area="lg" />}>
        <New
          defaults={defaults}
          onCreated={onCreated}
          onCancel={() => (canGoBack ? back() : close())}
        />
      </Suspense>
    </PluginBoundary>
  );
};

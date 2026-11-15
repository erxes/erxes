import { IconHistory, IconId } from '@tabler/icons-react';
import { skipToken, useQuery } from '@tanstack/react-query';
import {
  Spinner,
  type TPanelRecordType,
  type TRecordSlotProps,
  type TRecordTab,
  usePanelExpanded,
} from 'erxes-ui';
import { type ComponentType, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { SharedTimeline } from '~/modules/activity/SharedTimeline';
import { ContactDetailScroll } from '~/modules/side-panel/details/ContactDetailFields';
import { RecordPageHeader } from '~/modules/side-panel/RecordPageHeader';
import { type IRecordSidePanelTab, RecordSidePanel } from '~/modules/side-panel/RecordSidePanel';
import type { IRecordViewProps } from '~/modules/side-panel/recordView';
import { useCreatedPanelRecord } from '~/modules/side-panel/useCreatedPanelRecord';
import { useSidePanel, useSidePanelDraft } from '~/modules/side-panel/useSidePanel';
import { PluginBoundary } from './PluginBoundary';
import { usePluginRelationTabs } from './PluginRelationTabs';
import { usePluginRecordType } from './usePluginRecordType';

const DETAIL_TAB = 'detail';
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
 * Detail, the type's own tabs, every allowed plugin's relation tabs, then Activity: the order
 * a customer's tabs have. A type's tab `after: 'activity'` goes last.
 */
const useRecordTabs = (
  plugin: string,
  type: TPanelRecordType,
  record: TRecordSlotProps,
): IRecordSidePanelTab[] => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  const contacts = useRecordContacts(type, record.contentId);
  const relationTabs = usePluginRelationTabs({ ...record, contacts });
  const own = type.tabs ?? [];

  const ownTab = (tab: TRecordTab): IRecordSidePanelTab => ({
    value: tab.value,
    label: tab.label,
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

/** A loaded plugin record: core's header and tabs around the plugin's slots. */
const PluginRecordPanel = ({
  plugin,
  type,
  record,
  onBack,
  onClose,
}: IRecordViewProps & { plugin: string; type: TPanelRecordType }) => {
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
            <span className="flex min-w-0 items-center gap-2 text-sm font-medium">
              <type.icon className="size-4 flex-none" aria-hidden="true" />
              {title}
            </span>
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
        expandedDefaultTab={tabs.find((entry) => entry.value !== DETAIL_TAB)?.value}
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

  return <PluginRecordPanel {...props} plugin={entry.plugin} type={entry.type} />;
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

import {
  IconHierarchy2,
  IconHistory,
  IconId,
  IconLink,
  IconMessage,
} from '@tabler/icons-react';
import { ScrollArea } from 'erxes-ui';
import { useMemo, useState, type ReactNode, type RefObject } from 'react';
import {
  ContactOverviewSectionContext,
  type IRecordSidePanelTab,
  type TRelationEntity,
} from 'ui-modules';
import { ContactOverview } from '@/side-panel/components/relations/ContactOverview';
import type { TContactOverviewEntry } from '@/side-panel/components/relations/contactOverviewEntries';
import { SidePanelRelations } from '@/side-panel/components/relations/SidePanelRelations';
import { RecordPanelActivity } from '@/side-panel/components/details/RecordPanelActivity';
import { RenderPluginsComponent } from '~/plugins/components/RenderPluginsComponent';
import type { IContactPanelOverview } from '@/side-panel/hooks/useContactPanelOverview';

const DETAIL_TAB = 'detail';
const PROPERTIES_TAB = 'properties';
const RELATIONS_TAB = 'relations';
const ACTIVITY_TAB = 'activity';

// A module pinned as its own tab: the plugin's section on its own (it then
// manages itself), or a module's relation widget.
const PinnedModuleTab = ({
  entry,
  contactType,
  contentId,
  access,
  onUnavailable,
}: {
  entry: TContactOverviewEntry;
  contactType: 'core:customer' | 'core:company';
  contentId: string;
  access: 'read' | 'write';
  onUnavailable: (moduleKey: string) => void;
}) => {
  const [folded, setFolded] = useState(false);
  const overview = useMemo(
    () => ({ folded, setFolded, access, standalone: true }),
    [folded, setFolded, access],
  );
  return entry.kind === 'section' ? (
    <ContactOverviewSectionContext.Provider value={overview}>
      <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
        <RenderPluginsComponent
          pluginName={`${entry.module.pluginName}_ui`}
          remoteModuleName="contactWidget"
          props={{
            module: entry.module.name,
            contentType: contactType,
            contentId,
            access,
          }}
          onLoadError={() => onUnavailable(entry.key)}
        />
      </ScrollArea>
    </ContactOverviewSectionContext.Provider>
  ) : (
    <div className="flex flex-1 min-h-0 flex-col">{entry.tab.content}</div>
  );
};

interface IRecordPanelTabsOptions {
  record: TRelationEntity;
  views: { detail: ReactNode; properties: ReactNode } | null;
  pluginName: string | null;
  overview: IContactPanelOverview;
  access: 'read' | 'write';
  noteRef: RefObject<HTMLDivElement>;
  labels: Record<
    'detail' | 'properties' | 'messages' | 'relations' | 'activity',
    string
  >;
}

/** Composes available record views and related modules without changing their editor identities. */
export const buildRecordPanelTabs = ({
  record,
  views,
  pluginName,
  overview,
  access,
  noteRef,
  labels,
}: IRecordPanelTabsOptions): IRecordSidePanelTab[] => {
  const {
    contactType,
    moreTabs,
    allEntries,
    pinned,
    overviewEntries,
    layout,
    onUnavailable,
    onReorder,
    onToggleTab,
  } = overview;
  const conversationEntry =
    contactType === 'core:customer'
      ? pinned.find((entry) => entry.key === 'frontline.conversation')
      : undefined;
  const pinnedTabs: IRecordSidePanelTab[] = contactType
    ? pinned
        .filter((entry) => entry.key !== conversationEntry?.key)
        .map((entry) => ({
          value: `module:${entry.key}`,
          label: entry.label,
          icon: entry.icon || IconLink,
          content: (
            <PinnedModuleTab
              entry={entry}
              contactType={contactType}
              contentId={record.contentId}
              access={access}
              onUnavailable={onUnavailable}
            />
          ),
        }))
    : [];
  const relationsContent = contactType ? (
    <ContactOverview
      contactType={contactType}
      contentId={record.contentId}
      access={access}
      entries={overviewEntries}
      customize={{
        entries: allEntries,
        tabs: layout.tabs,
        onReorder,
        onToggleTab,
      }}
      onUnavailable={onUnavailable}
    />
  ) : (
    <SidePanelRelations tabs={moreTabs} />
  );
  const hasRelations = contactType
    ? allEntries.length > 0
    : moreTabs.length > 0;

  const tabs: IRecordSidePanelTab[] = [
    ...(views
      ? [
          {
            value: DETAIL_TAB,
            label: labels.detail,
            icon: IconId,
            content: views.detail,
          },
          ...(views.properties
            ? [
                {
                  value: PROPERTIES_TAB,
                  label: labels.properties,
                  icon: IconHierarchy2,
                  content: views.properties,
                },
              ]
            : []),
        ]
      : []),
    ...pinnedTabs,
    ...(contactType && conversationEntry
      ? [
          {
            value: 'messages',
            label: labels.messages,
            icon: IconMessage,
            content: (
              <PinnedModuleTab
                entry={conversationEntry}
                contactType={contactType}
                contentId={record.contentId}
                access={access}
                onUnavailable={onUnavailable}
              />
            ),
          },
        ]
      : []),
    ...(hasRelations
      ? [
          {
            value: RELATIONS_TAB,
            label: labels.relations,
            icon: IconLink,
            content: relationsContent,
          },
        ]
      : []),
    {
      value: ACTIVITY_TAB,
      label: labels.activity,
      icon: IconHistory,
      content: (
        <RecordPanelActivity
          record={record}
          pluginName={pluginName}
          noteRef={noteRef}
        />
      ),
    },
  ];

  return tabs;
};

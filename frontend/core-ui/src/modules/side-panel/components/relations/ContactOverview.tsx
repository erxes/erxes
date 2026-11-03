import { IconChevronRight } from '@tabler/icons-react';
import { Button, cn, ScrollArea } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useCallback, useMemo } from 'react';
import {
  ContactOverviewSectionContext,
  IContactOverviewSection,
  IRelationWidgetTab,
} from 'ui-modules';
import { IContactWidgetModule } from '@/side-panel/hooks/useContactWidgetModules';
import { contactOverviewFoldedState } from '@/side-panel/states/contactOverviewState';
import { RenderPluginsComponent } from '~/plugins/components/RenderPluginsComponent';
import { TContactOverviewEntry } from './contactOverviewEntries';
import { ContactOverviewCustomize } from './ContactOverviewCustomize';

type TContactType = 'core:customer' | 'core:company';

// One plugin section, its folded state kept by the overview.
const SectionSlot = ({
  sectionKey,
  module,
  contactType,
  contentId,
  folded,
  onFold,
  onUnavailable,
}: {
  sectionKey: string;
  module: IContactWidgetModule;
  contactType: TContactType;
  contentId: string;
  folded: boolean;
  onFold: (key: string, folded: boolean) => void;
  onUnavailable: (key: string) => void;
}) => {
  const value = useMemo<IContactOverviewSection>(
    () => ({ folded, setFolded: (next) => onFold(sectionKey, next) }),
    [sectionKey, folded, onFold],
  );

  return (
    <ContactOverviewSectionContext.Provider value={value}>
      <RenderPluginsComponent
        pluginName={`${module.pluginName}_ui`}
        remoteModuleName="contactWidget"
        props={{ module: module.name, contentType: contactType, contentId }}
        quiet
        onLoadError={() => onUnavailable(sectionKey)}
      />
    </ContactOverviewSectionContext.Provider>
  );
};

// A module without a section of its own: its relation widget, folded.
const OtherSection = ({
  tab,
  folded,
  onFold,
}: {
  tab: IRelationWidgetTab;
  folded: boolean;
  onFold: (folded: boolean) => void;
}) => (
  <section className="border-b last:border-b-0 py-1">
    <div className="flex items-center h-8 px-1.5">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 gap-1.5 px-1.5 text-xs font-medium"
        aria-expanded={!folded}
        onClick={() => onFold(!folded)}
      >
        <IconChevronRight
          className={cn(
            'size-3.5 text-muted-foreground transition-transform',
            !folded && 'rotate-90',
          )}
        />
        <tab.icon className="size-4 text-muted-foreground" />
        {tab.label}
      </Button>
    </div>
    {!folded && (
      <div className="mx-1.5 mb-1 flex h-80 flex-col overflow-hidden rounded-sm border">
        {tab.content}
      </div>
    )}
  </section>
);

/**
 * A customer's or company's linked records: each module as a foldable
 * section, in the order the user set (`customize`, which also pins modules
 * as panel tabs), with no plugin grouping.
 */
export const ContactOverview = ({
  contactType,
  contentId,
  entries,
  customize,
  onUnavailable,
}: {
  contactType: TContactType;
  contentId: string;
  // The modules shown here, in order (those pinned as tabs left out).
  entries: TContactOverviewEntry[];
  customize: React.ComponentProps<typeof ContactOverviewCustomize>;
  onUnavailable: (key: string) => void;
}) => {
  const [foldedMap, setFoldedMap] = useAtom(contactOverviewFoldedState);

  const isFolded = (key: string, byDefault: boolean) =>
    foldedMap[`${contactType}:${key}`] ?? byDefault;

  const setFolded = useCallback(
    (key: string, folded: boolean) =>
      setFoldedMap((previous) => ({
        ...previous,
        [`${contactType}:${key}`]: folded,
      })),
    [contactType, setFoldedMap],
  );

  return (
    <div className="flex flex-1 min-h-0 flex-col">
      {customize.entries.length > 0 && (
        <div className="flex h-9 flex-none items-center justify-end border-b px-2">
          <ContactOverviewCustomize {...customize} />
        </div>
      )}
      <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
        {entries.map((entry) =>
          entry.kind === 'section' ? (
            <SectionSlot
              key={entry.key}
              sectionKey={entry.key}
              module={entry.module}
              contactType={contactType}
              contentId={contentId}
              folded={isFolded(entry.key, false)}
              onFold={setFolded}
              onUnavailable={onUnavailable}
            />
          ) : (
            <OtherSection
              key={entry.key}
              tab={entry.tab}
              folded={isFolded(entry.key, true)}
              onFold={(folded) => setFolded(entry.key, folded)}
            />
          ),
        )}
      </ScrollArea>
    </div>
  );
};

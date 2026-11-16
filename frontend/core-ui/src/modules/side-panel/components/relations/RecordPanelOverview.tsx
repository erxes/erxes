import { useMemo } from 'react';
import {
  ContactOverviewSectionContext,
  IContactOverviewSection,
  type IRecordOverviewSectionSlot,
  RecordOverview,
} from 'ui-modules';
import type { IRecordPanelOverview } from '@/side-panel/hooks/useRecordPanelOverview';
import { RenderPluginsComponent } from '~/plugins/components/RenderPluginsComponent';

type TContactType = 'core:customer' | 'core:company';

const SectionSlot = ({
  sectionKey,
  section,
  contactType,
  contentId,
  access,
  folded,
  onFold,
  onUnavailable,
}: IRecordOverviewSectionSlot & {
  contactType: TContactType;
  contentId: string;
  access: 'read' | 'write';
  onUnavailable: (key: string) => void;
}) => {
  const value = useMemo<IContactOverviewSection>(
    () => ({ folded, setFolded: (next) => onFold(sectionKey, next), access }),
    [sectionKey, folded, onFold, access],
  );

  return (
    <ContactOverviewSectionContext.Provider value={value}>
      <RenderPluginsComponent
        pluginName={`${section.pluginName}_ui`}
        remoteModuleName="contactWidget"
        props={{
          module: section.name,
          contentType: contactType,
          contentId,
          access,
        }}
        quiet
        onLoadError={() => onUnavailable(sectionKey)}
      />
    </ContactOverviewSectionContext.Provider>
  );
};

export const RecordPanelOverview = ({
  overview,
  contentId,
  access,
}: {
  overview: IRecordPanelOverview;
  contentId: string;
  access: 'read' | 'write';
}) => {
  const { contactType, onUnavailable } = overview;

  return (
    <RecordOverview
      overview={overview}
      renderSection={
        contactType
          ? (slot) => (
              <SectionSlot
                {...slot}
                contactType={contactType}
                contentId={contentId}
                access={access}
                onUnavailable={onUnavailable}
              />
            )
          : undefined
      }
    />
  );
};

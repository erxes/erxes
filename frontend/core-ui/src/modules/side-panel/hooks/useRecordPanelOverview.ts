import { useState } from 'react';
import {
  type IRecordOverview,
  type IRelationWidgetTab,
  useRecordOverview,
} from 'ui-modules';
import { useContactWidgetModules } from '@/side-panel/hooks/useContactWidgetModules';

export interface IRecordPanelOverview extends IRecordOverview {
  contactType: 'core:customer' | 'core:company' | null;
  moreTabs: IRelationWidgetTab[];
  onUnavailable: (key: string) => void;
}

export const useRecordPanelOverview = (
  contentType: string,
  relationTabs: IRelationWidgetTab[],
): IRecordPanelOverview => {
  const contactType =
    contentType === 'core:customer' || contentType === 'core:company'
      ? contentType
      : null;
  const modules = useContactWidgetModules();
  const [unavailable, setUnavailable] = useState<string[]>([]);
  const sections = contactType
    ? modules.filter(
        (module) =>
          !unavailable.includes(`${module.pluginName}.${module.name}`),
      )
    : [];
  const sectionKeys = new Set(
    sections.map((module) => `${module.pluginName}.${module.name}`),
  );
  const moreTabs = relationTabs.filter((tab) => !sectionKeys.has(tab.value));
  const overview = useRecordOverview({
    contentType,
    sections,
    tabs: contactType ? moreTabs : [],
  });

  return {
    ...overview,
    contactType,
    moreTabs,
    onUnavailable: (key) =>
      setUnavailable((previous) =>
        previous.includes(key) ? previous : [...previous, key],
      ),
  };
};

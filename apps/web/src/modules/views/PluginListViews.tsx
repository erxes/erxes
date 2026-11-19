import { PluginListType } from '@erxes/core-contract';
import { IconLayoutList } from '@tabler/icons-react';
import { TabButton, type TPluginListType, type TViewTabsProps } from 'erxes-ui';
import { useEffect } from 'react';
import { ViewChanges } from './ViewControls';
import { ViewTabs } from './ViewTabs';

/** Whether core keeps views of a plugin's list. A type it refuses is the plugin's bug. */
const keepsViews = (recordType: TPluginListType) => PluginListType.safeParse(recordType).success;

/**
 * A plugin list's saved views as tabs. A record type core can't store leaves the list with
 * "All …" alone, and the console names the type for the plugin's developer.
 */
export const PluginViewTabs = ({ recordType, allLabel }: TViewTabsProps) => {
  const valid = keepsViews(recordType);

  useEffect(() => {
    if (!valid) {
      console.error(
        `[plugins] no saved views for "${recordType}": a list's record type is <plugin>:<record>, in lower case letters, digits and _`,
      );
    }
  }, [valid, recordType]);

  return valid ? (
    <ViewTabs recordType={recordType} allLabel={allLabel} />
  ) : (
    <TabButton type="button" aria-current="page" active>
      <IconLayoutList />
      {allLabel}
    </TabButton>
  );
};

/** The filter's reset and save, for a plugin list core keeps views of. */
export const PluginViewChanges = ({ recordType }: { recordType: TPluginListType }) =>
  keepsViews(recordType) ? <ViewChanges recordType={recordType} /> : null;

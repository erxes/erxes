import { useState } from 'react';

const SESSION_TAB_PREFIX = 'automations:tab:';

/**
 * Tab state that survives navigation within the browser session. The active
 * tab is kept in sessionStorage under the given key, so returning to the page
 * (e.g. after a create/edit round-trip) restores the last selected tab.
 */
export const useSessionTab = (
  key: string,
  defaultValue: string,
  validValues?: string[],
) => {
  const storageKey = `${SESSION_TAB_PREFIX}${key}`;
  const [activeTab, setActiveTab] = useState(() => {
    const stored = sessionStorage.getItem(storageKey);

    if (stored && (!validValues || validValues.includes(stored))) {
      return stored;
    }

    return defaultValue;
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    sessionStorage.setItem(storageKey, value);
  };

  return [activeTab, handleTabChange] as const;
};

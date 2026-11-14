import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { type AssistantTab, assistantActiveTabState, assistantTabsState } from './assistantState';
import { dropSession } from './chatSession';

const blankTab = (): AssistantTab => ({ key: crypto.randomUUID(), threadId: null });

export const useAssistantTabs = () => {
  const [tabs, setTabs] = useAtom(assistantTabsState);
  const [activeKey, setActiveKey] = useAtom(assistantActiveTabState);

  useEffect(() => {
    if (tabs.length > 0) return;

    const tab = blankTab();

    setTabs([tab]);
    setActiveKey(tab.key);
  }, [tabs.length, setTabs, setActiveKey]);

  const active = tabs.find((tab) => tab.key === activeKey) ?? tabs[0] ?? null;

  const newChat = () => {
    const blank = tabs.find((tab) => tab.threadId === null);

    if (blank) {
      setActiveKey(blank.key);

      return;
    }

    const tab = blankTab();

    setTabs([...tabs, tab]);
    setActiveKey(tab.key);
  };

  const openThread = (threadId: string) => {
    const open = tabs.find((tab) => tab.threadId === threadId);

    if (open) {
      setActiveKey(open.key);

      return;
    }

    const tab = { key: crypto.randomUUID(), threadId };

    setTabs([...tabs, tab]);
    setActiveKey(tab.key);
  };

  const closeTab = (key: string) => {
    const index = tabs.findIndex((tab) => tab.key === key);
    const rest = tabs.filter((tab) => tab.key !== key);
    const next = rest.length > 0 ? rest : [blankTab()];

    dropSession(key);
    setTabs(next);

    if (active?.key === key) setActiveKey((next[Math.max(0, index - 1)] ?? next[0])?.key ?? null);
  };

  const forgetThread = (threadId: string) => {
    tabs.filter((tab) => tab.threadId === threadId).forEach((tab) => closeTab(tab.key));
  };

  const setThreadId = (key: string, threadId: string) =>
    setTabs((current) => current.map((tab) => (tab.key === key ? { ...tab, threadId } : tab)));

  return { tabs, active, setActiveKey, newChat, openThread, closeTab, forgetThread, setThreadId };
};

export type AssistantTabs = ReturnType<typeof useAssistantTabs>;

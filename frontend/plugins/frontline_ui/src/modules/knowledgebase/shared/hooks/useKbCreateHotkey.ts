import { useScopedHotkeys, useSetHotkeyScope } from 'erxes-ui';
import { useEffect } from 'react';
import { KnowledgeBaseHotKeyScope } from '@/knowledgebase/types';

export const useKbCreateHotkey = ({
  scope,
  isSheetOpen,
  onCreate,
}: {
  scope: KnowledgeBaseHotKeyScope;
  isSheetOpen: boolean;
  onCreate: () => void;
}) => {
  const setHotkeyScope = useSetHotkeyScope();

  useEffect(() => {
    setHotkeyScope(isSheetOpen ? KnowledgeBaseHotKeyScope.FormSheet : scope);
  }, [scope, isSheetOpen, setHotkeyScope]);

  useScopedHotkeys('c', onCreate, scope, [onCreate]);
};

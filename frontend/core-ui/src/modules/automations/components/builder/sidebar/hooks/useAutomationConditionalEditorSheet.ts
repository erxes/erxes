import { useEffect, useState } from 'react';
import { TAutomationConditional, useAutomationConditionals } from 'ui-modules';

/**
 * The sheet edits a copy: Apply hands it to the action's draft, Cancel drops
 * it. The action's own Save Configuration still decides what is kept.
 */
export const useAutomationConditionalEditorSheet = () => {
  const store = useAutomationConditionals();
  const editor = store?.editor ?? null;
  const [draft, setDraft] = useState<TAutomationConditional | null>(null);

  useEffect(() => {
    setDraft(editor ? store?.getSnapshot()[editor.id] ?? null : null);
  }, [editor, store]);

  const apply = () => {
    if (store && editor && draft) {
      store.setConditional(editor.id, draft);
    }

    store?.closeEditor();
  };

  const cancel = () => store?.closeEditor();

  return {
    isOpen: !!editor && !!draft,
    editor,
    draft,
    setDraft,
    apply,
    cancel,
    onOpenChange: (open: boolean) => {
      if (!open) {
        cancel();
      }
    },
  };
};

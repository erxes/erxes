import { useDirectMailComposerStateContext } from '@/integrations/mail/composer/hooks/useDirectMailComposerStateContext';
import type { DirectMailDraftActions } from '@/integrations/mail/composer/types/directMailDraft';
import {
  directMailDraftSchema,
  draftBlocksSchema,
} from '@/integrations/mail/composer/utils/directMailDraft';
import { toast } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useCallback, useEffect, useRef } from 'react';
import { currentUserState } from 'ui-modules';

export const useDirectMailDraft = (): DirectMailDraftActions => {
  const {
    canComposeEmail,
    editor,
    form,
    target,
    attachments,
    recipientCustomerId,
    showCc,
    showBcc,
    setTarget,
    setAttachments,
    setRecipientCustomerId,
    setShowCc,
    setShowBcc,
  } = useDirectMailComposerStateContext();
  const { reset, getValues, watch } = form;
  const currentUser = useAtomValue(currentUserState);
  const draftKey = currentUser?._id
    ? `frontline:mail-draft:${currentUser._id}`
    : undefined;
  const restoredKey = useRef<string>();
  const storageErrorShown = useRef(false);
  const draftClosed = useRef(false);
  useEffect(() => {
    if (!draftKey || !canComposeEmail || restoredKey.current === draftKey)
      return;
    restoredKey.current = draftKey;
    try {
      const saved = sessionStorage.getItem(draftKey);
      if (!saved) return;
      const parsed: unknown = JSON.parse(saved);
      const draft = directMailDraftSchema.parse(parsed);
      if (draft.values.body) {
        const blocks: unknown = JSON.parse(draft.values.body);
        editor.replaceBlocks(editor.document, draftBlocksSchema.parse(blocks));
      }
      reset(draft.values);
      setTarget(draft.target);
      setRecipientCustomerId(draft.recipientCustomerId);
      setAttachments(draft.attachments);
      setShowCc(draft.showCc);
      setShowBcc(draft.showBcc);
    } catch {
      toast({ title: 'Unable to restore email draft', variant: 'destructive' });
    }
  }, [
    canComposeEmail,
    draftKey,
    editor,
    reset,
    setTarget,
    setAttachments,
    setRecipientCustomerId,
    setShowCc,
    setShowBcc,
  ]);

  useEffect(() => {
    if (!draftKey || !target || !canComposeEmail) return;
    const save = () => {
      if (draftClosed.current) return;
      try {
        sessionStorage.setItem(
          draftKey,
          JSON.stringify({
            target,
            values: getValues(),
            attachments,
            recipientCustomerId,
            showCc,
            showBcc,
          }),
        );
      } catch {
        if (!storageErrorShown.current) {
          storageErrorShown.current = true;
          toast({
            title: 'Unable to save email draft in this browser',
            variant: 'destructive',
          });
        }
      }
    };
    save();
    const subscription = watch(() => save());
    return () => subscription.unsubscribe();
  }, [
    attachments,
    canComposeEmail,
    draftKey,
    getValues,
    recipientCustomerId,
    showBcc,
    showCc,
    target,
    watch,
  ]);

  const beginDraft = useCallback(() => {
    draftClosed.current = false;
  }, []);
  const clearDraft = useCallback(() => {
    draftClosed.current = true;
    if (draftKey) {
      try {
        sessionStorage.removeItem(draftKey);
      } catch {
        toast({
          title: 'Unable to clear saved email draft',
          variant: 'destructive',
        });
      }
    }
  }, [draftKey]);

  return { beginDraft, clearDraft };
};

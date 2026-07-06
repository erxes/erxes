import { useEffect, useRef } from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';

const AUTOSAVE_DEBOUNCE_MS = 5000;

/**
 * Silently saves draft posts a few seconds after the user stops editing.
 * Only runs for existing posts (autosaving a new post would create it
 * prematurely) and only while the post is still a draft, so half-typed
 * edits never go live on a published post.
 */
export const usePostAutosave = ({
  form,
  enabled,
  save,
}: {
  form: UseFormReturn<FieldValues>;
  enabled: boolean;
  save: (data: FieldValues, options: { silent: boolean }) => Promise<void>;
}) => {
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const savingRef = useRef(false);
  const saveRef = useRef(save);
  saveRef.current = save;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const subscription = form.watch(() => {
      const { status } = form.getValues() as FieldValues;

      if (!form.formState.isDirty || status !== 'draft') {
        return;
      }

      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        if (savingRef.current || !form.formState.isDirty) {
          return;
        }

        savingRef.current = true;
        try {
          await saveRef.current(form.getValues(), { silent: true });
        } finally {
          savingRef.current = false;
        }
      }, AUTOSAVE_DEBOUNCE_MS);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timerRef.current);
    };
  }, [enabled, form]);
};

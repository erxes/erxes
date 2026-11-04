import { useAtomValue, useSetAtom, type WritableAtom } from 'jotai';
import { useEffect, useState, type SetStateAction } from 'react';
import {
  type FieldValues,
  type UseFormReturn,
  useWatch,
} from 'react-hook-form';

type MessengerFormAtom<T extends FieldValues> = WritableAtom<
  T | null,
  [SetStateAction<T | null>],
  unknown
>;

/** Restores each Messenger step before syncing later local edits to its atom. */
export const EMFormValueEffectComponent = <T extends FieldValues>({
  form,
  atom,
}: {
  atom: MessengerFormAtom<T>;
  form: UseFormReturn<T>;
}) => {
  // `persistValueTaken` becomes true once it is safe for the setter effect to
  // start writing form values back into the atom.
  //
  // • When atomValue is already null on mount (fresh "Add" flow with no saved
  //   data) we start as true immediately — there is nothing to restore, so the
  //   setter can begin syncing right away.
  // • When atomValue is non-null on mount (edit flow or saved draft) we start
  //   as false and let EMFormResetEffectComponent do one reset first, then flip
  //   the flag so subsequent keystrokes are synced without triggering a re-reset.
  const atomValue = useAtomValue(atom);
  const [persistValueTaken, setPersistValueTaken] = useState(
    () => atomValue === null,
  );

  return (
    <>
      <EMFormResetEffectComponent
        form={form}
        atom={atom}
        persistValueTaken={persistValueTaken}
        setPersistValueTaken={setPersistValueTaken}
      />
      <EMFormValueSetterEffectComponent
        form={form}
        atom={atom}
        persistValueTaken={persistValueTaken}
      />
    </>
  );
};

/** Hydrates a mounted step before unlocking writes to its cached draft. */
export const EMFormResetEffectComponent = <T extends FieldValues>({
  form,
  atom,
  persistValueTaken,
  setPersistValueTaken,
}: {
  form: UseFormReturn<T>;
  atom: MessengerFormAtom<T>;
  persistValueTaken: boolean;
  setPersistValueTaken: (value: boolean) => void;
}) => {
  const { reset } = form;
  const atomValue = useAtomValue(atom);

  // Watch atomValue until it's non-null, then reset the form once and lock
  // the gate. This handles two cases correctly:
  //
  //  • Sync  — atom already has data in localStorage on mount → fires
  //             immediately on the first render.
  //  • Async — atom starts null (cleared by EditErxesMessengerSheet reset
  //             while the API query is in-flight). The effect keeps watching
  //             until setEMSetupValues() populates the atom, then fires once.
  //
  // After locking (persistValueTaken = true) the setter effect takes over and
  // writes form changes back into the atom. This effect is now fully blocked,
  // so user keystrokes never trigger a re-reset.
  useEffect(() => {
    if (persistValueTaken) return undefined; // already initialised — do nothing
    if (!atomValue) return undefined; // still waiting for data
    const timeout = setTimeout(() => {
      reset(atomValue);
      setPersistValueTaken(true);
    });
    return () => clearTimeout(timeout);
  }, [atomValue, persistValueTaken, reset, setPersistValueTaken]);

  return null;
};

/** Stores the latest typed form values only after the draft has been restored. */
export const EMFormValueSetterEffectComponent = <T extends FieldValues>({
  form,
  atom,
  persistValueTaken,
}: {
  form: UseFormReturn<T>;
  atom: MessengerFormAtom<T>;
  persistValueTaken: boolean;
}) => {
  const formValues = useWatch({
    control: form.control,
  });
  const setAtomValue = useSetAtom(atom);

  useEffect(() => {
    if (persistValueTaken) {
      setAtomValue(form.getValues());
    }
  }, [form, formValues, persistValueTaken, setAtomValue]);

  return null;
};

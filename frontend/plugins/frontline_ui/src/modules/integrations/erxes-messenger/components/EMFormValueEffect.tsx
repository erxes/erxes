import { z } from 'zod';
import { useAtomValue, useSetAtom, WritableAtom } from 'jotai';
import { useCallback, useEffect, useState } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';

export const EMFormValueEffectComponent = ({
  form,
  atom,
}: {
  atom: WritableAtom<any, [value: any], void>;
  form: UseFormReturn<z.infer<any>>;
}) => {
  // `persistValueTaken` becomes true once we have done the first reset, at
  // which point it is safe for the setter effect to start writing form values
  // back into the atom.
  const [persistValueTaken, setPersistValueTaken] = useState(false);

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

export const EMFormResetEffectComponent = ({
  form,
  atom,
  persistValueTaken,
  setPersistValueTaken,
}: {
  form: UseFormReturn<z.infer<any>>;
  atom: WritableAtom<any, [value: any], void>;
  persistValueTaken: boolean;
  setPersistValueTaken: (value: boolean) => void;
}) => {
  const { reset } = form;
  const atomValue = useAtomValue(atom);

  const resetForm = useCallback(
    (value: any) => {
      setTimeout(() => {
        reset(value);
      });
    },
    [reset],
  );

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
    if (persistValueTaken) return; // already initialised — do nothing
    if (!atomValue) return; // still waiting for data
    setPersistValueTaken(true);
    resetForm(atomValue);
  }, [atomValue, persistValueTaken, resetForm, setPersistValueTaken]);

  return null;
};

export const EMFormValueSetterEffectComponent = ({
  form,
  atom,
  persistValueTaken,
}: {
  form: UseFormReturn<z.infer<any>>;
  atom: WritableAtom<any, [value: any], void>;
  persistValueTaken: boolean;
}) => {
  const formValues = useWatch({
    control: form.control,
  });
  const setAtomValue = useSetAtom(atom);

  useEffect(() => {
    if (persistValueTaken) {
      setAtomValue(formValues);
    }
  }, [formValues, persistValueTaken, setAtomValue]);

  return null;
};

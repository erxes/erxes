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

  const resetForm = useCallback(async () => {
    setTimeout(() => {
      reset(atomValue);
    });
  }, [reset, atomValue]);

  useEffect(() => {
    if (persistValueTaken) {
      return;
    }
    setPersistValueTaken(true);
    if (!atomValue) {
      return;
    }
    resetForm();
  }, [resetForm, persistValueTaken, atomValue, setPersistValueTaken]);

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

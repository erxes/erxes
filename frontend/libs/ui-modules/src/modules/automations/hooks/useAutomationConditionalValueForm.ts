import { useEffect, useRef, useState } from 'react';
import { FieldValues, useForm, UseFormReturn } from 'react-hook-form';
import { getPathKey } from '../utils/conditionalUtils';

const readPath = (source: unknown, path: string): unknown =>
  path.split('.').reduce<unknown>((current, segment) => {
    if (current === null || typeof current !== 'object') {
      return undefined;
    }

    return (current as Record<string, unknown>)[segment];
  }, source);

const writePath = (target: FieldValues, path: string, value: unknown) => {
  const segments = path.split('.');
  let current: Record<string, unknown> = target;

  segments.slice(0, -1).forEach((segment, index) => {
    if (current[segment] === null || typeof current[segment] !== 'object') {
      current[segment] = /^\d+$/.test(segments[index + 1]) ? [] : {};
    }

    current = current[segment] as Record<string, unknown>;
  });

  current[segments[segments.length - 1]] = value;
};

/**
 * One row's own form: it starts from the whole parent form so inputs can read
 * neighbouring fields (a stage picker reads its pipeline), but only the
 * conditional's own keys travel back out.
 */
export const useAutomationConditionalValueForm = ({
  parentForm,
  names,
  values,
  onChange,
}: {
  parentForm: UseFormReturn<FieldValues>;
  names: string[];
  values: Record<string, unknown>;
  onChange: (values: Record<string, unknown>) => void;
}) => {
  const [defaultValues] = useState(() => {
    const seeded = structuredClone(parentForm.getValues());

    names.forEach((name) => writePath(seeded, name, values[getPathKey(name)]));

    return seeded;
  });

  const form = useForm<FieldValues>({ defaultValues });
  const onChangeRef = useRef(onChange);
  const namesRef = useRef(names);
  onChangeRef.current = onChange;
  namesRef.current = names;

  useEffect(() => {
    const subscription = form.watch((current) => {
      onChangeRef.current(
        Object.fromEntries(
          namesRef.current.map((name) => [
            getPathKey(name),
            readPath(current, name),
          ]),
        ),
      );
    });

    return () => subscription.unsubscribe();
  }, [form]);

  return form;
};

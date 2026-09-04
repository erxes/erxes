import { useEffect, useState } from 'react';
import { FieldPath } from 'react-hook-form';
import { useSegment } from '../context/SegmentProvider';
import { TNodePath, TSegmentForm } from '../types';

export const useSegmentNodeValue = <TValue>(name: TNodePath) => {
  const { form } = useSegment();

  const [value, setValue] = useState<TValue | undefined>(
    () => form.getValues(name as FieldPath<TSegmentForm>) as TValue | undefined,
  );

  useEffect(() => {
    const read = () =>
      setValue(
        form.getValues(name as FieldPath<TSegmentForm>) as TValue | undefined,
      );

    read();

    return form.subscribe({
      name,
      formState: { values: true },
      callback: read,
    });
  }, [form, name]);

  return value;
};

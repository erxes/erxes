import { useState, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'erxes-ui';

export function useJSONBodyBuilder(name: string, value: any) {
  const { getValues, setValue } = useFormContext();
  const [rawOpen, setRawOpen] = useState(false);
  const [rawValue, setRawValue] = useState(() => {
    try {
      return JSON.stringify(value ?? {}, null, 2);
    } catch {
      return '';
    }
  });

  const onToggleRaw = useCallback(() => {
    setRawValue(() => {
      try {
        return JSON.stringify(getValues(name) ?? {}, null, 2);
      } catch {
        return '';
      }
    });
    setRawOpen((prev) => !prev);
  }, [getValues, name]);

  const onApplyRaw = useCallback(() => {
    try {
      const parsed = JSON.parse(rawValue || '{}');
      setValue(name, parsed, { shouldDirty: true, shouldTouch: true });
      setRawOpen(false);
    } catch (e) {
      toast({ title: 'Invalid JSON', description: e.message });
    }
  }, [rawValue, setValue, name]);

  const onRawValueChange = useCallback((value: string) => {
    setRawValue(value);
  }, []);

  return {
    rawOpen,
    rawValue,
    onToggleRaw,
    onApplyRaw,
    onRawValueChange,
  };
}

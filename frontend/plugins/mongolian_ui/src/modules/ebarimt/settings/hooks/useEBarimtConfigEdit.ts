import { DocumentNode, useQuery } from '@apollo/client';
import { useEffect, useRef, useState } from 'react';
import { FieldValues, UseFormReset } from 'react-hook-form';

interface IMnConfig {
  _id: string;
  value?: unknown;
}

interface IMnConfigsQueryData {
  mnConfigs?: IMnConfig[];
}

interface UseEBarimtConfigEditOptions<T extends FieldValues> {
  code: string;
  configId: string | null;
  getFormValues: (detail: Partial<T>) => T;
  query: DocumentNode;
  reset: UseFormReset<T>;
}

const parseConfigValue = <T extends FieldValues>(
  value: unknown,
): Partial<T> => {
  let parsedValue: unknown = value;

  if (typeof value === 'string') {
    try {
      parsedValue = JSON.parse(value);
    } catch {
      return {};
    }
  }

  if (
    !parsedValue ||
    typeof parsedValue !== 'object' ||
    Array.isArray(parsedValue)
  ) {
    return {};
  }

  // GraphQL JSON is an untyped external boundary. The feature-specific mapper
  // below supplies every form field and normalizes non-scalar values.
  return parsedValue as Partial<T>;
};

export const useEBarimtConfigEdit = <T extends FieldValues>({
  code,
  configId,
  getFormValues,
  query,
  reset,
}: UseEBarimtConfigEditOptions<T>) => {
  const loadedIdRef = useRef<string | null>(null);
  const [loadedConfigId, setLoadedConfigId] = useState<string | null>(null);
  const { data } = useQuery<IMnConfigsQueryData>(query, {
    variables: { code },
    skip: !configId,
  });

  useEffect(() => {
    if (!configId) {
      loadedIdRef.current = null;
      setLoadedConfigId(null);
      return;
    }

    if (loadedIdRef.current === configId) {
      return;
    }

    setLoadedConfigId(null);
    reset(getFormValues({}));

    const config = data?.mnConfigs?.find(({ _id }) => _id === configId);
    if (!config) {
      return;
    }

    loadedIdRef.current = configId;
    reset(getFormValues(parseConfigValue<T>(config.value)));
    setLoadedConfigId(configId);
  }, [configId, data, getFormValues, reset]);

  return {
    isConfigLoaded: Boolean(configId && loadedConfigId === configId),
  };
};

import { useLazyQuery } from '@apollo/client';
import { toast } from 'erxes-ui/hooks';
import { useCallback, useRef, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { SEGMENTS_PREVIEW_COUNT } from '../graphql/queries';
import { TSegmentForm } from '../types';

type TStats = {
  count: number;
  unsupported?: string[];
  exceeded?: boolean;
};

export const useSegmentStats = ({
  contentType,
  form,
}: {
  contentType: string;
  form: UseFormReturn<TSegmentForm>;
}) => {
  const [stats, setStats] = useState<TStats>();
  const lastCounted = useRef<string>();

  const [previewCount, { called, loading }] = useLazyQuery(
    SEGMENTS_PREVIEW_COUNT,
  );

  const run = useCallback(
    async (root: unknown) => {
      const { data } = await previewCount({
        variables: { contentType, root },
        fetchPolicy: 'network-only',
        onError: (error) =>
          toast({
            title: 'Could not count the segment',
            description: error.message,
            variant: 'destructive',
          }),
      });

      if (data?.segmentsPreviewCount) {
        setStats(data.segmentsPreviewCount);
      }
    },
    [contentType, previewCount],
  );

  const handleCalculateStats = useCallback(() => {
    const root = form.getValues('root');

    lastCounted.current = JSON.stringify(root);

    return run(root);
  }, [form, run]);

  const countSettled = useCallback(() => {
    const root = form.getValues('root');
    const shape = JSON.stringify(root);

    if (shape === lastCounted.current || !isCountable(root)) {
      return;
    }

    lastCounted.current = shape;
    run(root);
  }, [form, run]);

  return {
    handleCalculateStats,
    countSettled,
    stats,
    loading: called && loading,
  };
};

const isCountable = (node: unknown): boolean => {
  const current = node as {
    kind?: string;
    children?: unknown[];
    child?: unknown;
    fieldKey?: string;
    operator?: string;
    segmentId?: string;
  };

  if (!current?.kind) {
    return false;
  }

  if (current.kind === 'group') {
    return !!current.children?.length && current.children.every(isCountable);
  }

  if (current.kind === 'segment') {
    return !!current.segmentId;
  }

  if (current.kind === 'relation') {
    return current.child === undefined || isCountable(current.child);
  }

  return !!current.fieldKey && !!current.operator;
};

import { zodResolver } from '@hookform/resolvers/zod';
import { useSetAtom } from 'jotai';
import { createContext, useContext, useEffect } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { useSegmentStats } from '../hooks/useSegmentStats';
import { segmentFormDirtyAtom } from '../states/segmentFormDirty';
import { segmentFormSchemaFor } from '../states/segmentFormSchema';
import { ISegment, TSegmentForm } from '../types';
import { emptyCondition, emptyGroup } from '../types/segmentNode';

type SegmentFormContextType = {
  contentType: string;
  ownedBy?: string;
  form: UseFormReturn<TSegmentForm>;
  segment?: ISegment;
  stats: ReturnType<typeof useSegmentStats>;
};

const SegmentFormContext = createContext<SegmentFormContextType | null>(null);

const defaultValues = (
  contentType: string,
  segment?: ISegment,
): TSegmentForm => ({
  name: segment?.name || '',
  description: segment?.description || '',
  color: segment?.color || '',
  visibility: segment?.visibility || 'organization',
  root: segment?.root || {
    ...emptyGroup(),
    children: [emptyCondition(contentType)],
  },
});

export const SegmentProvider = ({
  children,
  contentType,
  segment,
  ownedBy,
}: {
  children: React.ReactNode;
  contentType: string;
  segment?: ISegment;
  ownedBy?: string;
}) => {
  const owner = segment
    ? segment.ownedBy || (segment.name?.trim() ? undefined : ownedBy)
    : ownedBy;

  const form = useForm<TSegmentForm>({
    resolver: zodResolver(segmentFormSchemaFor(owner)),
    defaultValues: defaultValues(contentType, segment),
  });

  const { isDirty } = form.formState;
  const setDirty = useSetAtom(segmentFormDirtyAtom);

  useEffect(() => {
    setDirty(isDirty);

    return () => setDirty(false);
  }, [isDirty, setDirty]);

  const stats = useSegmentStats({ contentType, form });

  return (
    <SegmentFormContext.Provider
      value={{ contentType, ownedBy: owner, form, segment, stats }}
    >
      {children}
    </SegmentFormContext.Provider>
  );
};

export const useSegment = () => {
  const context = useContext(SegmentFormContext);

  if (!context) {
    throw new Error('useSegment must be used inside a SegmentProvider');
  }

  return context;
};

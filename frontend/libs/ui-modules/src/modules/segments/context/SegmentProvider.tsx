import { zodResolver } from '@hookform/resolvers/zod';
import { createContext, useContext, useEffect } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { segmentFormSchema } from '../states/segmentFormSchema';
import { ISegment, TSegmentForm } from '../types';
import { emptyCondition, emptyGroup } from '../types/segmentNode';

type SegmentFormContextType = {
  contentType: string;
  form: UseFormReturn<TSegmentForm>;
  segment?: ISegment;
};

const SegmentFormContext = createContext<SegmentFormContextType | null>(null);

/** A new segment opens on one empty condition, so the form is never blank. */
const defaultValues = (
  contentType: string,
  segment?: ISegment,
): TSegmentForm => ({
  name: segment?.name || '',
  description: segment?.description || '',
  color: segment?.color || '',
  root: segment?.root || {
    ...emptyGroup(),
    children: [emptyCondition(contentType)],
  },
});

export const SegmentProvider = ({
  children,
  contentType,
  segment,
}: {
  children: React.ReactNode;
  contentType: string;
  segment?: ISegment;
}) => {
  const form = useForm<TSegmentForm>({
    resolver: zodResolver(segmentFormSchema),
    defaultValues: defaultValues(contentType, segment),
  });

  const { reset } = form;

  useEffect(() => {
    reset(defaultValues(contentType, segment));
  }, [contentType, segment, reset]);

  return (
    <SegmentFormContext.Provider value={{ contentType, form, segment }}>
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

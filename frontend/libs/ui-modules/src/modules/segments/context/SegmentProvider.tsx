import { zodResolver } from '@hookform/resolvers/zod';
import { createContext, useContext } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { segmentFormSchema } from 'ui-modules/modules/segments/states/segmentFormSchema';
import { ISegment, TSegmentForm } from 'ui-modules/modules/segments/types';
import { getSegmentFormDefaultValues } from 'ui-modules/modules/segments/utils/segmentFormUtils';

interface SegmentFormContextType {
  contentType: string;
  form: UseFormReturn<TSegmentForm>;
  segment?: ISegment;
}

const SegmentFormContext = createContext<SegmentFormContextType | null>(null);

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
    values: contentType
      ? getSegmentFormDefaultValues(contentType, segment || {})
      : undefined,
  });

  return (
    <SegmentFormContext.Provider
      value={{
        form,
        contentType,
        segment,
      }}
    >
      {children}
    </SegmentFormContext.Provider>
  );
};

export const useSegment = () => {
  const ctx = useContext(SegmentFormContext);
  if (!ctx) throw new Error('useSegment must be used within SegmentProvider');
  return ctx;
};

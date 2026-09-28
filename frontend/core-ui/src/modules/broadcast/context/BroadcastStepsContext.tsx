import { createContext, ReactNode, useContext } from 'react';
import { FormProvider } from 'react-hook-form';
import {
  TBroadcastStepsOptions,
  useBroadcastStepsState,
} from '../hooks/useBroadcastStepsState';

type TBroadcastStepsContext = Omit<
  ReturnType<typeof useBroadcastStepsState>,
  'form'
>;

const BroadcastStepsContext = createContext<TBroadcastStepsContext | null>(
  null,
);

export const useBroadcastSteps = () => {
  const context = useContext(BroadcastStepsContext);

  if (!context) {
    throw new Error(
      'useBroadcastSteps must be used within a BroadcastStepsProvider',
    );
  }

  return context;
};

/** The campaign being written, and where in writing it someone is. */
export const BroadcastStepsProvider = ({
  children,
  ...options
}: TBroadcastStepsOptions & { children: ReactNode }) => {
  const { form, ...steps } = useBroadcastStepsState(options);

  return (
    <FormProvider {...form}>
      <BroadcastStepsContext.Provider value={steps}>
        {children}
      </BroadcastStepsContext.Provider>
    </FormProvider>
  );
};

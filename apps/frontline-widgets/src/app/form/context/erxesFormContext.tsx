import { createContext, useContext } from 'react';
import { IFormData } from '../types/formTypes';

export const ErxesFormContext = createContext<IFormData | null>(null);

export const ErxesFormProvider = ({
  children,
  form,
}: {
  form: IFormData;
  children: React.ReactNode;
}) => {
  return (
    <ErxesFormContext.Provider value={form}>
      {children}
    </ErxesFormContext.Provider>
  );
};

export const useErxesForm = () => {
  const context = useContext(ErxesFormContext);
  if (!context) {
    throw new Error('useErxesForm must be used within an ErxesFormProvider');
  }
  return context;
};

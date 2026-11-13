import {
  TTemplateWizardState,
  useTemplateWizard,
} from '@/template/hooks/useTemplateWizard';
import { TTemplate } from '@/template/types';
import { createContext, ReactNode, useContext } from 'react';

const TemplateWizardContext = createContext<TTemplateWizardState | null>(null);

/** One wizard state for the header, the steps and the summary. */
export const TemplateWizardProvider = ({
  template,
  children,
}: {
  template: TTemplate;
  children: ReactNode;
}) => (
  <TemplateWizardContext.Provider value={useTemplateWizard(template)}>
    {children}
  </TemplateWizardContext.Provider>
);

export const useTemplateWizardContext = () => {
  const context = useContext(TemplateWizardContext);

  if (!context) {
    throw new Error('useTemplateWizardContext needs TemplateWizardProvider');
  }

  return context;
};

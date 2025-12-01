import { ReactNode, createContext, useContext, useMemo } from 'react';
import { useTemplateEdit } from '../hooks/useTemplateEdit';
import { useTemplateAdd } from '../hooks/useTemplateAdd';
import { useTemplateRemove } from '../hooks/useTemplateRemove';
import { useTemplateUse } from '../hooks/useTemplateUse';
interface TemplateContextType {
  addTemplate: ReturnType<typeof useTemplateAdd>['addTemplate'];
  editTemplate: ReturnType<typeof useTemplateEdit>['editTemplate'];
  removeTemplate: ReturnType<typeof useTemplateRemove>['removeTemplate'];
  useTemplate: ReturnType<typeof useTemplateUse>['useTemplate'];
  loading: boolean;
  error: any;
}

const TemplateContext = createContext<TemplateContextType | undefined>(
  undefined,
);

export const TemplateProvider = ({ children }: { children: ReactNode }) => {
  const {
    addTemplate,
    loading: loadingAdd,
    error: errorAdd,
  } = useTemplateAdd();
  const {
    editTemplate,
    loading: loadingEdit,
    error: errorEdit,
  } = useTemplateEdit();
  const {
    removeTemplate,
    loading: loadingRemove,
    error: errorRemove,
  } = useTemplateRemove();
  const {
    useTemplate,
    loading: loadingUse,
    error: errorUse,
  } = useTemplateUse();

  const loading = loadingAdd || loadingEdit || loadingRemove || loadingUse;
  const error = errorAdd || errorEdit || errorRemove || errorUse;

  const value = useMemo(
    () => ({
      addTemplate,
      editTemplate,
      removeTemplate,
      useTemplate,
      loading,
      error,
    }),
    [addTemplate, editTemplate, removeTemplate, useTemplate, loading, error],
  );

  return (
    <TemplateContext.Provider value={value}>
      {children}
    </TemplateContext.Provider>
  );
};

export const useTemplateContext = () => {
  const context = useContext(TemplateContext);
  if (!context) {
    throw new Error(
      'useTemplateContext must be used within a TemplateProvider',
    );
  }
  return context;
};

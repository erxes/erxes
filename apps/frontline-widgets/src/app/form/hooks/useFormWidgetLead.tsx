import { useMutation } from '@apollo/client';
import { FORM_WIDGET_SAVE_LEAD } from '../graphql/formMutations';

export const useFormWidgetLead = () => {
  const [saveLead, { data, loading, error }] = useMutation(
    FORM_WIDGET_SAVE_LEAD,
  );

  return {
    saveLead,
    data,
    loading,
    error,
  };
};

import { useMutation } from '@apollo/client';
import { FORM_WIDGET_CONNECT } from '../graphql/formMutations';
import { IFormData } from '../types/formTypes';

export const useWidgetConnect = () => {
  const [connectMutation, { data, loading, error }] = useMutation<{
    widgetsLeadConnect: { form: IFormData };
  }>(FORM_WIDGET_CONNECT);

  return {
    connectMutation,
    form: data?.widgetsLeadConnect.form,
    loading,
    error,
  };
};

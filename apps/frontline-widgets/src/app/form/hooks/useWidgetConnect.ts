import { useMutation } from '@apollo/client';
import { FORM_CONNECT, FORM_WIDGET_CONNECT } from '../graphql/formMutations';

export const useWidgetConnect = () => {
  const [connectMutation, { data, loading, error }] =
    useMutation(FORM_WIDGET_CONNECT);

  return {
    connectMutation,
    data,
    loading,
    error,
  };
};

export const useFormConnect = () => {
  const [connectMutation, { data, loading, error }] = useMutation(FORM_CONNECT);

  return {
    connectMutation,
    data,
    loading,
    error,
  };
};

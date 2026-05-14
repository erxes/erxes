import { useMutation } from '@apollo/client';
import { EDIT_ELEMENT } from '../graphql/mutation';
import { IElementTranslationInput } from './useCreateElement';

interface EditElementResponse {
  bmsElementEdit: {
    _id: string;
  };
}

export interface IEditElementVariables {
  id: string;
  name?: string;
  note?: string;
  startTime?: string;
  duration?: number;
  cost?: number;
  categories?: string[];
  quick?: boolean;
  language?: string;
  translations?: IElementTranslationInput[];
}

export const useEditElement = () => {
  const [editElementMutation, { loading, error }] = useMutation<
    EditElementResponse,
    IEditElementVariables
  >(EDIT_ELEMENT, {
    refetchQueries: ['BmsElements'],
    awaitRefetchQueries: true,
  });

  const editElement = (options: {
    variables: IEditElementVariables;
    onCompleted?: (data: EditElementResponse) => void;
    onError?: (error: unknown) => void;
  }) => {
    return editElementMutation(options);
  };

  return {
    editElement,
    loading,
    error,
  };
};

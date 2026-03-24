import { useMutation } from '@apollo/client';
import { CREATE_ELEMENT } from '../graphql/mutation';

interface CreateElementResponse {
  bmsElementAdd: {
    _id: string;
  };
}

export interface ICreateElementVariables {
  branchId?: string;
  name?: string;
  note?: string;
  startTime?: string;
  duration?: number;
  cost?: number;
  categories?: string[];
  quick?: boolean;
}

export const useCreateElement = () => {
  const [createElementMutation, { loading, error }] = useMutation<
    CreateElementResponse,
    ICreateElementVariables
  >(CREATE_ELEMENT, {
    refetchQueries: ['BmsElements'],
    awaitRefetchQueries: true,
  });

  const createElement = (options: {
    variables: ICreateElementVariables;
    onCompleted?: (data: CreateElementResponse) => void;
    onError?: (error: unknown) => void;
  }) => {
    return createElementMutation(options);
  };

  return {
    createElement,
    loading,
    error,
  };
};

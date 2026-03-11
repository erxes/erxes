import { useMutation } from '@apollo/client';
import { CREATE_TOUR } from '../graphql/mutation';

interface CreateTourResponse {
  bmsTourAdd: {
    _id: string;
    name?: string;
    content?: string;
    branchId?: string;
    createdAt?: string;
  };
}

export interface ICreateTourVariables {
  branchId: string;
  name: string;
  content: string;
  date_status:
    | 'running'
    | 'completed'
    | 'scheduled'
    | 'cancelled'
    | 'unscheduled';
}

export const useCreateTour = () => {
  const [createTourMutation, { loading, error }] = useMutation<
    CreateTourResponse,
    ICreateTourVariables
  >(CREATE_TOUR, {
    refetchQueries: ['BmsTours'],
    awaitRefetchQueries: true,
  });

  const createTour = (options: {
    variables: ICreateTourVariables;
    onCompleted?: (data: CreateTourResponse) => void;
    onError?: (error: unknown) => void;
  }) => {
    return createTourMutation(options);
  };

  return {
    createTour,
    loading,
    error,
  };
};

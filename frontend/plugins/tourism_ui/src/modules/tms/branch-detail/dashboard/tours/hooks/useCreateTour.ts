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
  refNumber: string;
  content?: string;
  date_status:
    | 'running'
    | 'completed'
    | 'scheduled'
    | 'cancelled'
    | 'unscheduled';
  status?: string;
  groupCode?: string;
  itineraryId?: string;
  startDate?: Date;
  endDate?: Date;
  groupSize?: number;
  duration?: number;
  cost?: number;
  guides?: Array<{ guideId: string; name?: string }>;
  info1?: string;
  info2?: string;
  info3?: string;
  info4?: string;
  info5?: string;
  images?: string[];
  imageThumbnail?: string;
  advancePercent?: number;
  advanceCheck?: boolean;
  joinPercent?: number;
  personCost?: Record<string, any>;
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

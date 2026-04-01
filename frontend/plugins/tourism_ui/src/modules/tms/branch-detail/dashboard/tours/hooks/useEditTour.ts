import { useMutation } from '@apollo/client';
import { EDIT_TOUR } from '../graphql/mutation';
import {
  GET_TOURS,
  GET_TOUR_GROUPS,
  GET_TOUR_DETAIL,
} from '../graphql/queries';

export interface IPricingOption {
  _id?: string;
  title: string;
  minPersons: number;
  maxPersons?: number;
  pricePerPerson: number;
  accommodationType?: string;
  domesticFlightPerPerson?: number;
  singleSupplement?: number;
  note?: string;
}

export interface IEditTourVariables {
  id: string;
  dateStatus:
    | 'scheduled'
    | 'unscheduled'
    | 'running'
    | 'completed'
    | 'cancelled';
  name?: string;
  content?: string;
  itineraryId?: string;
  dateType?: 'fixed' | 'flexible';
  startDate?: Date;
  endDate?: Date;
  availableFrom?: Date;
  availableTo?: Date;
  groupSize?: number;
  duration?: number;
  advancePercent?: number;
  joinPercent?: number;
  advanceCheck?: boolean;
  status?: string;
  cost?: number;
  guides?: Array<{
    guideId: string;
    name?: string;
  }>;
  refNumber?: string;
  info1?: string;
  info2?: string;
  info3?: string;
  info4?: string;
  info5?: string;
  personCost?: Record<string, any>;
  images?: string[];
  imageThumbnail?: string;
  attachment?: { url: string; name: string; type: string; size: number } | null;
  categoryIds?: string[];
  pricingOptions?: IPricingOption[];
}

interface IEditTourResponse {
  bmsTourEdit: {
    _id: string;
  };
}

export const useEditTour = () => {
  const [editTourMutation, { loading, error }] = useMutation<
    IEditTourResponse,
    IEditTourVariables
  >(EDIT_TOUR, {
    refetchQueries: [{ query: GET_TOURS }, { query: GET_TOUR_GROUPS }],
  });

  const editTour = async (variables: IEditTourVariables) => {
    const result = await editTourMutation({
      variables,
      refetchQueries: [
        { query: GET_TOURS },
        { query: GET_TOUR_GROUPS },
        { query: GET_TOUR_DETAIL, variables: { id: variables.id } },
      ],
      awaitRefetchQueries: true,
    });

    return result.data?.bmsTourEdit;
  };

  return {
    editTour,
    loading,
    error,
  };
};

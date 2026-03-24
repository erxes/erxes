import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_TOUR_DETAIL } from '../graphql/queries';

export interface ITourDetail {
  _id: string;
  advanceCheck?: boolean;
  advancePercent?: number;
  content?: string;
  cost?: number;
  date_status?:
    | 'scheduled'
    | 'unscheduled'
    | 'running'
    | 'completed'
    | 'cancelled';
  dateType?: 'fixed' | 'flexible';
  duration?: number;
  categoryIds?: string[];
  endDate?: string;
  availableFrom?: string;
  availableTo?: string;
  groupSize?: number;
  imageThumbnail?: string;
  images?: string[];
  info1?: string;
  info2?: string;
  info3?: string;
  info4?: string;
  info5?: string;
  itineraryId?: string;
  joinPercent?: number;
  name?: string;
  personCost?: Record<string, any>;
  refNumber?: string;
  startDate?: string;
  status?: string;
}

type TourDetailQueryVariables = {
  id: string;
};

export const useTourDetail = (
  options?: QueryHookOptions<
    {
      bmsTourDetail: ITourDetail;
    },
    TourDetailQueryVariables
  >,
) => {
  const { data, loading, error, refetch } = useQuery<
    { bmsTourDetail: ITourDetail },
    TourDetailQueryVariables
  >(GET_TOUR_DETAIL, options);

  return {
    loading,
    error,
    refetch,
    tourDetail: data?.bmsTourDetail,
  };
};

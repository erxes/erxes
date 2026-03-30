import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_TOUR_DETAIL } from '../graphql/queries';

export interface IPricingOption {
  _id: string;
  title: string;
  minPersons: number;
  maxPersons?: number;
  pricePerPerson: number;
  accommodationType?: string;
  domesticFlightPerPerson?: number;
  singleSupplement?: number;
  note?: string;
}

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
  attachment?: {
    url: string;
    name: string;
    type: string;
    size: number;
  } | null;
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
  pricingOptions?: IPricingOption[];
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

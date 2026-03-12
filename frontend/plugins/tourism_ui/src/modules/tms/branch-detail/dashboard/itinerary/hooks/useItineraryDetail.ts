import { useQuery } from '@apollo/client';
import { GET_ITINERARY_DETAIL } from '../graphql/queries';

export interface IItineraryDetail {
  _id: string;
  branchId?: string;
  name?: string;
  duration?: number;
  color?: string;
  totalCost?: number;
  groupDays?: Array<{
    day?: number;
    title?: string;
    content?: string;
    elements?: Array<{ elementId?: string; orderOfDay?: number }>;
    elementsQuick?: Array<{ elementId?: string; orderOfDay?: number }>;
    images?: string[];
  }>;
  guideCost?: number;
  driverCost?: number;
  foodCost?: number;
  gasCost?: number;
  personCost?: Record<string, number>;
  guideCostExtra?: number;
  createdAt?: string;
  modifiedAt?: string;
}

interface ItineraryDetailResponse {
  bmsItineraryDetail: IItineraryDetail;
}

export const useItineraryDetail = (id?: string) => {
  const { data, loading, error, refetch } = useQuery<ItineraryDetailResponse>(
    GET_ITINERARY_DETAIL,
    {
      variables: { id },
      skip: !id,
    }
  );

  return {
    itinerary: data?.bmsItineraryDetail,
    loading,
    error,
    refetch,
  };
};

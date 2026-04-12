import { useQuery } from '@apollo/client';
import { GET_ITINERARY_DETAIL } from '../graphql/queries';
import { IItineraryTranslation } from '../types/itinerary';

export interface IItineraryDetail {
  _id: string;
  branchId?: string;
  language?: string;
  name?: string;
  duration?: number;
  totalCost?: number;
  images?: [string];
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
  content?: string;
  color?: string;
  translations?: IItineraryTranslation[];
}

interface ItineraryDetailResponse {
  bmsItineraryDetail: IItineraryDetail;
}

interface ItineraryDetailVariables {
  id?: string;
  language?: string;
}

export const useItineraryDetail = (
  id?: string,
  enabled = true,
  language?: string,
) => {
  const { data, loading, error, refetch } = useQuery<ItineraryDetailResponse>(
    GET_ITINERARY_DETAIL,
    {
      variables: { id, language } as ItineraryDetailVariables,
      skip: !id || !enabled,
      fetchPolicy: 'cache-and-network',
    },
  );

  return {
    itinerary: data?.bmsItineraryDetail,
    loading,
    error,
    refetch,
  };
};

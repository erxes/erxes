import type {
  BmsItinerariesQuery,
  BmsItineraryDetailQuery,
} from '~/gql/graphql';

export type IItinerary = NonNullable<
  NonNullable<
    NonNullable<BmsItinerariesQuery['bmsItineraries']>['list']
  >[number]
>;

export type IItineraryDetail = NonNullable<
  BmsItineraryDetailQuery['bmsItineraryDetail']
>;

export type IItineraryOption = Pick<IItinerary, '_id' | 'name' | 'duration'>;

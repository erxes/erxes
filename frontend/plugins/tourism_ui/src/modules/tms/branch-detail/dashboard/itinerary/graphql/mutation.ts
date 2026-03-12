import { gql } from '@apollo/client';

export const CREATE_ITINERARY = gql`
  mutation BmsItineraryAdd(
    $groupDays: [DayItemInput]
    $totalCost: Float
    $images: [String]
    $branchId: String
    $name: String
    $content: String
    $duration: Int
    $color: String
  ) {
    bmsItineraryAdd(
      groupDays: $groupDays
      totalCost: $totalCost
      images: $images
      branchId: $branchId
      name: $name
      content: $content
      duration: $duration
      color: $color
    ) {
      _id
    }
  }
`;

export const REMOVE_ITINERARY = gql`
  mutation BmsItineraryRemove($ids: [String]) {
    bmsItineraryRemove(ids: $ids)
  }
`;

import { gql } from '@apollo/client';

export const CREATE_ITINERARY = gql`
  mutation BmsItineraryAdd(
    $groupDays: [DayItemInput]
    $totalCost: Float
    $branchId: String
    $name: String
    $duration: Int
    $color: String
    $images: [String]
    $guideCost: Float
    $driverCost: Float
    $foodCost: Float
    $gasCost: Float
    $personCost: JSON
    $guideCostExtra: Float
    $content: String
  ) {
    bmsItineraryAdd(
      groupDays: $groupDays
      totalCost: $totalCost
      branchId: $branchId
      name: $name
      duration: $duration
      color: $color
      images: $images
      guideCost: $guideCost
      driverCost: $driverCost
      foodCost: $foodCost
      gasCost: $gasCost
      personCost: $personCost
      guideCostExtra: $guideCostExtra
      content: $content
    ) {
      _id
    }
  }
`;

export const EDIT_ITINERARY = gql`
  mutation BmsItineraryEdit(
    $id: String!
    $branchId: String
    $name: String
    $duration: Int
    $totalCost: Float
    $groupDays: [DayItemInput]
    $color: String
    $images: [String]
    $foodCost: Float
    $personCost: JSON
    $gasCost: Float
    $driverCost: Float
    $guideCost: Float
    $guideCostExtra: Float
    $content: String
  ) {
    bmsItineraryEdit(
      _id: $id
      branchId: $branchId
      name: $name
      duration: $duration
      totalCost: $totalCost
      groupDays: $groupDays
      color: $color
      images: $images
      foodCost: $foodCost
      personCost: $personCost
      gasCost: $gasCost
      driverCost: $driverCost
      guideCost: $guideCost
      guideCostExtra: $guideCostExtra
      content: $content
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

import { gql } from '@apollo/client';

export const CREATE_TOUR = gql`
  mutation BmsTourAdd(
    $branchId: String
    $date_status: DATE_STATUS!
    $status: String
    $name: String
    $refNumber: String
    $groupCode: String
    $content: String
    $itineraryId: String
    $startDate: Date
    $endDate: Date
    $groupSize: Int
    $duration: Int
    $cost: Float
    $guides: [GuideItemInput]
    $info1: String
    $info2: String
    $info3: String
    $info4: String
    $info5: String
    $images: [String]
    $imageThumbnail: String
    $advancePercent: Float
    $advanceCheck: Boolean
    $joinPercent: Float
    $personCost: JSON
  ) {
    bmsTourAdd(
      branchId: $branchId
      date_status: $date_status
      status: $status
      name: $name
      refNumber: $refNumber
      groupCode: $groupCode
      content: $content
      itineraryId: $itineraryId
      startDate: $startDate
      endDate: $endDate
      groupSize: $groupSize
      duration: $duration
      cost: $cost
      guides: $guides
      info1: $info1
      info2: $info2
      info3: $info3
      info4: $info4
      info5: $info5
      images: $images
      imageThumbnail: $imageThumbnail
      advancePercent: $advancePercent
      advanceCheck: $advanceCheck
      joinPercent: $joinPercent
      personCost: $personCost
    ) {
      _id
    }
  }
`;

export const REMOVE_TOUR = gql`
  mutation BmsTourRemove($ids: [String]) {
    bmsTourRemove(ids: $ids)
  }
`;

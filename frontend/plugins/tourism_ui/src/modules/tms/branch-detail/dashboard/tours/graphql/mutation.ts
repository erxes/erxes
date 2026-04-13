import { gql } from '@apollo/client';

export const CREATE_TOUR = gql`
  mutation BmsTourAdd(
    $branchId: String
    $language: String
    $date_status: DATE_STATUS!
    $status: String
    $name: String
    $refNumber: String
    $groupCode: String
    $content: String
    $itineraryId: String
    $dateType: DATE_TYPE
    $startDate: Date
    $endDate: Date
    $availableFrom: Date
    $availableTo: Date
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
    $attachment: AttachmentInput
    $advancePercent: Float
    $advanceCheck: Boolean
    $joinPercent: Float
    $personCost: JSON
    $categoryIds: [String]
    $pricingOptions: [PricingOptionInput]
    $translations: [TourTranslationInput]
  ) {
    bmsTourAdd(
      branchId: $branchId
      language: $language
      date_status: $date_status
      status: $status
      name: $name
      refNumber: $refNumber
      groupCode: $groupCode
      content: $content
      itineraryId: $itineraryId
      dateType: $dateType
      startDate: $startDate
      endDate: $endDate
      availableFrom: $availableFrom
      availableTo: $availableTo
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
      attachment: $attachment
      advancePercent: $advancePercent
      advanceCheck: $advanceCheck
      joinPercent: $joinPercent
      personCost: $personCost
      categoryIds: $categoryIds
      pricingOptions: $pricingOptions
      translations: $translations
    ) {
      _id
    }
  }
`;

export const EDIT_TOUR = gql`
  mutation BmsTourEdit(
    $id: String!
    $language: String
    $dateStatus: DATE_STATUS!
    $name: String
    $content: String
    $itineraryId: String
    $dateType: DATE_TYPE
    $startDate: Date
    $endDate: Date
    $availableFrom: Date
    $availableTo: Date
    $groupSize: Int
    $duration: Int
    $advancePercent: Float
    $joinPercent: Float
    $advanceCheck: Boolean
    $status: String
    $cost: Float
    $guides: [GuideItemInput]
    $refNumber: String
    $info1: String
    $info2: String
    $info3: String
    $info4: String
    $info5: String
    $personCost: JSON
    $images: [String]
    $imageThumbnail: String
    $attachment: AttachmentInput
    $categoryIds: [String]
    $pricingOptions: [PricingOptionInput]
    $translations: [TourTranslationInput]
  ) {
    bmsTourEdit(
      _id: $id
      language: $language
      date_status: $dateStatus
      name: $name
      content: $content
      itineraryId: $itineraryId
      dateType: $dateType
      startDate: $startDate
      endDate: $endDate
      availableFrom: $availableFrom
      availableTo: $availableTo
      groupSize: $groupSize
      duration: $duration
      advancePercent: $advancePercent
      joinPercent: $joinPercent
      advanceCheck: $advanceCheck
      status: $status
      cost: $cost
      guides: $guides
      refNumber: $refNumber
      info1: $info1
      info2: $info2
      info3: $info3
      info4: $info4
      info5: $info5
      personCost: $personCost
      images: $images
      imageThumbnail: $imageThumbnail
      attachment: $attachment
      categoryIds: $categoryIds
      pricingOptions: $pricingOptions
      translations: $translations
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

export const EDIT_TOUR_ORDER = gql`
  mutation BmsOrderEdit($id: String!, $order: BmsOrderInput) {
    bmsOrderEdit(_id: $id, order: $order) {
      _id
      branchId
      customerId
      tourId
      amount
      status
      note
      numberOfPeople
      type
      additionalCustomers
      isChild
      parent
      createdAt
    }
  }
`;

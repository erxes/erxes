import { gql } from '@apollo/client';

export const UPDATE_ASSIGNMENT_CAMPAIGN = gql`
  mutation UpdateAssignmentCampaign(
    $_id: String!
    $title: String
    $description: String
    $startDate: Date
    $endDate: Date
    $finishDateOfUse: Date
    $attachment: AttachmentInput
    $status: String
    $fieldId: String
    $allowMultiWin: Boolean
    $segmentIds: [String]
    $voucherCampaignId: String
  ) {
    assignmentCampaignsEdit(
      _id: $_id
      title: $title
      description: $description
      startDate: $startDate
      endDate: $endDate
      finishDateOfUse: $finishDateOfUse
      attachment: $attachment
      status: $status
      fieldId: $fieldId
      segmentIds: $segmentIds
      allowMultiWin: $allowMultiWin
      voucherCampaignId: $voucherCampaignId
    ) {
      _id
      createdAt
      createdBy
      modifiedAt
      modifiedBy
      title
      description
      startDate
      endDate
      finishDateOfUse
      attachment {
        url
        name
        size
        type
        __typename
      }
      status
      fieldId
      allowMultiWin
      segmentIds
      voucherCampaignId
    }
  }
`;

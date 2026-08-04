import { gql } from '@apollo/client';

export const CREATE_ASSIGNMENT_CAMPAIGN = gql`
  mutation CreateAssignmentCampaign(
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
    assignmentCampaignsAdd(
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

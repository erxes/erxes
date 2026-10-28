import { gql } from '@apollo/client';
import { APPROVAL_REQUEST_FIELDS } from 'ui-modules';

export const CORE_APPROVAL_REQUEST_PANEL = gql`
  query coreApprovalRequestPanelDetail($id: String!) {
    approvalRequestDetail(_id: $id) {
      ...ApprovalRequestFields
      content {
        contentType
        contentId
        label
        ownerId
      }
      requester {
        _id
        email
        username
        details {
          fullName
          firstName
          lastName
          avatar
        }
      }
      requiredApprovers {
        _id
        email
        username
        details {
          fullName
          firstName
          lastName
          avatar
        }
      }
    }
  }
  ${APPROVAL_REQUEST_FIELDS}
`;

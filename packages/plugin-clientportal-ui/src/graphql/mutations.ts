import { clientPortalUserFields, commonFields } from './queries';

const createOrUpdateConfig = `
  mutation clientPortalConfigUpdate(
    $config: ClientPortalConfigInput!
  ) {
    clientPortalConfigUpdate(
      config: $config
    ) {
      ${commonFields}
    }
  }
`;

const commonUserFields = `
  $firstName: String,
  $lastName: String,
  $username: String,
  $code: String,
  $email: String,
  $phone: String,
  $companyName: String,
  $companyRegistrationNumber: String,
  $type: String,
  $clientPortalId: String,
  $ownerId: String,
  $links: JSON,
  $customFieldsData: JSON,
  $avatar: String
`;

const commonUserVariables = `
  firstName: $firstName,
  lastName: $lastName,
  username: $username,
  code: $code,
  email: $email,
  phone: $phone,
  companyName: $companyName,
  companyRegistrationNumber: $companyRegistrationNumber,
  type: $type
  clientPortalId: $clientPortalId,
  ownerId: $ownerId,
  links: $links,
  customFieldsData: $customFieldsData
  avatar: $avatar
`;

const clientPortalUsersInvite = `
  mutation clientPortalUsersInvite(${commonUserFields}) {
    clientPortalUsersInvite(${commonUserVariables}) {
      ${clientPortalUserFields}
    }
  }
`;

const clientPortalUsersEdit = `
  mutation clientPortalUsersEdit($_id: String!, ${commonUserFields}) {
    clientPortalUsersEdit(_id: $_id, ${commonUserVariables}) {
      ${clientPortalUserFields}
    }
  }
`;

const clientPortalUsersRemove = `
  mutation clientPortalUsersRemove($clientPortalUserIds: [String!]) {
    clientPortalUsersRemove(clientPortalUserIds: $clientPortalUserIds)
  }
`;

const clientPortalUserAssignCompany = `
   mutation clientPortalUserAssignCompany($userId: String!, $erxesCompanyId: String!, $erxesCustomerId: String!){
    clientPortalUserAssignCompany(userId: $userId, erxesCompanyId: $erxesCompanyId, erxesCustomerId: $erxesCustomerId)
   }
`;

const remove = `
  mutation clientPortalRemove(
    $_id: String!
  ) {
    clientPortalRemove(
      _id: $_id,
    )
  }
`;

const verifyUsers = `
mutation clientPortalUsersVerify($type: String, $userIds: [String]!) {
  clientPortalUsersVerify(type: $type, userIds: $userIds)
}
`;

const clientPortalCommentsAdd = `
  mutation clientPortalCommentsAdd(
    $typeId: String!
    $type: String!
    $content: String!
    $userType: String!
  ) {
    clientPortalCommentsAdd(
      typeId: $typeId
      type: $type
      content: $content
      userType: $userType
    ) {
      _id
    }
  }
`;

const clientPortalCommentsRemove = `
  mutation clientPortalCommentsRemove(
    $_id: String!
  ) {
    clientPortalCommentsRemove(
      _id: $_id
    ) 
  }
`;

const changeVerificationStatus = `
mutation ClientPortalUsersChangeVerificationStatus($status: ClientPortalUserVerificationStatus!, $userId: String!) {
  clientPortalUsersChangeVerificationStatus(status: $status, userId: $userId)
}
`;

const editFields = `
mutation ClientPortalFieldConfigsEdit($fieldId: String!, $allowedClientPortalIds: [String], $requiredOn: [String]) {
  clientPortalFieldConfigsEdit(fieldId: $fieldId, allowedClientPortalIds: $allowedClientPortalIds, requiredOn: $requiredOn) {
    allowedClientPortalIds
    fieldId
    requiredOn
  }
}
`;

export default {
  createOrUpdateConfig,
  remove,
  clientPortalUsersInvite,
  clientPortalUsersEdit,
  clientPortalUsersRemove,
  verifyUsers,
  clientPortalCommentsAdd,
  clientPortalCommentsRemove,
  changeVerificationStatus,
  editFields,
  clientPortalUserAssignCompany
};

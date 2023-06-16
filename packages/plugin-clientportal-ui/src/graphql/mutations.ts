import { clientPortalUserFields, commonFields } from './queries';

const createOrUpdateConfig = `
  mutation clientPortalConfigUpdate(
    $_id: String
    $name: String
    $description: String
    $logo: String
    $icon: String
    $headerHtml: String
    $footerHtml: String
    $url: String
    $domain: String
    $messengerBrandCode: String
    $knowledgeBaseLabel: String
    $knowledgeBaseTopicId: String
    $ticketLabel: String
    $dealLabel: String
    $purchaseLabel: String
    $taskPublicBoardId: String
    $taskPublicPipelineId: String
    $taskPublicLabel: String
    $taskLabel: String
    $taskStageId: String
    $taskPipelineId: String
    $taskBoardId: String
    $ticketStageId: String
    $ticketPipelineId: String
    $ticketBoardId: String
    $dealStageId: String
    $dealPipelineId: String
    $dealBoardId: String
    $purchaseStageId: String
    $purchasePipelineId: String
    $purchaseBoardId: String
    $styles: StylesParams
    $mobileResponsive: Boolean
    $googleCredentials: JSON
    $googleClientId: String
    $googleRedirectUri: String
    $googleClientSecret: String
    $facebookAppId: String
    $erxesAppToken: String

    $kbToggle: Boolean
    $publicTaskToggle: Boolean
    $ticketToggle: Boolean
    $taskToggle: Boolean
    $dealToggle: Boolean
    $purchaseToggle: Boolean
    $otpConfig: OTPConfigInput
    $mailConfig: MailConfigInput
    $manualVerificationConfig: JSON
    $passwordVerificationConfig: JSON
    $tokenPassMethod: TokenPassMethod
    $tokenExpiration: Int
    $refreshTokenExpiration: Int
  ) {
    clientPortalConfigUpdate(
      _id: $_id,
      name: $name,
      description: $description,
      url: $url,
      logo: $logo,
      icon: $icon,
      headerHtml: $headerHtml,
      footerHtml: $footerHtml,
      domain: $domain,
      messengerBrandCode: $messengerBrandCode,
      knowledgeBaseLabel: $knowledgeBaseLabel,
      knowledgeBaseTopicId: $knowledgeBaseTopicId,
      taskPublicBoardId: $taskPublicBoardId,
      taskPublicPipelineId: $taskPublicPipelineId,
      taskPublicLabel: $taskPublicLabel,
      ticketLabel: $ticketLabel,
      taskLabel: $taskLabel,
      dealLabel: $dealLabel,
      purchaseLabel: $purchaseLabel,
      taskStageId: $taskStageId,
      taskPipelineId: $taskPipelineId,
      taskBoardId: $taskBoardId,
      ticketStageId: $ticketStageId,
      ticketPipelineId: $ticketPipelineId,
      ticketBoardId: $ticketBoardId,
      dealStageId: $dealStageId,
      dealPipelineId: $dealPipelineId,
      dealBoardId: $dealBoardId
      purchaseStageId: $purchaseStageId,
      purchasePipelineId: $purchasePipelineId,
      purchaseBoardId: $purchaseBoardId
      styles: $styles
      mobileResponsive: $mobileResponsive
      googleCredentials: $googleCredentials
      googleClientId: $googleClientId
      googleRedirectUri: $googleRedirectUri
      googleClientSecret: $googleClientSecret
      facebookAppId: $facebookAppId
      erxesAppToken: $erxesAppToken

      kbToggle: $kbToggle,
      publicTaskToggle: $publicTaskToggle,
      ticketToggle: $ticketToggle,
      taskToggle: $taskToggle,
      dealToggle: $dealToggle,
      purchaseToggle: $purchaseToggle,
      otpConfig: $otpConfig
      mailConfig: $mailConfig
      manualVerificationConfig: $manualVerificationConfig
      passwordVerificationConfig: $passwordVerificationConfig
      tokenPassMethod: $tokenPassMethod
      tokenExpiration: $tokenExpiration
      refreshTokenExpiration: $refreshTokenExpiration
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

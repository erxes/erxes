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
    $taskPublicBoardId: String
    $taskPublicPipelineId: String
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
    $styles: StylesParams
    $mobileResponsive: Boolean
    $googleCredentials: JSON
    $googleClientId: String
    $googleRedirectUri: String
    $googleClientSecret: String
    $facebookAppId: String

    $kbToggle: Boolean
    $publicTaskToggle: Boolean
    $ticketToggle: Boolean
    $taskToggle: Boolean
    $dealToggle: Boolean
    $otpConfig: OTPConfigInput
    $mailConfig: MailConfigInput
    $manualVerificationConfig: JSON
    $passwordVerificationConfig: JSON
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
      ticketLabel: $ticketLabel,
      taskLabel: $taskLabel,
      dealLabel: $dealLabel,
      taskStageId: $taskStageId,
      taskPipelineId: $taskPipelineId,
      taskBoardId: $taskBoardId,
      ticketStageId: $ticketStageId,
      ticketPipelineId: $ticketPipelineId,
      ticketBoardId: $ticketBoardId,
      dealStageId: $dealStageId,
      dealPipelineId: $dealPipelineId,
      dealBoardId: $dealBoardId
      styles: $styles
      mobileResponsive: $mobileResponsive
      googleCredentials: $googleCredentials
      googleClientId: $googleClientId
      googleRedirectUri: $googleRedirectUri
      googleClientSecret: $googleClientSecret
      facebookAppId: $facebookAppId

      kbToggle: $kbToggle,
      publicTaskToggle: $publicTaskToggle,
      ticketToggle: $ticketToggle,
      taskToggle: $taskToggle,
      dealToggle: $dealToggle,
      otpConfig: $otpConfig
      mailConfig: $mailConfig
      manualVerificationConfig: $manualVerificationConfig
      passwordVerificationConfig: $passwordVerificationConfig
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

export default {
  createOrUpdateConfig,
  remove,
  clientPortalUsersInvite,
  clientPortalUsersEdit,
  clientPortalUsersRemove,
  verifyUsers,
  clientPortalCommentsAdd,
  clientPortalCommentsRemove,
  changeVerificationStatus
};

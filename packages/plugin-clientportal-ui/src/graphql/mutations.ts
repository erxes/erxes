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
    $taskPublicBoardId: String
    $taskPublicPipelineId: String
    $taskLabel: String
    $taskStageId: String
    $taskPipelineId: String
    $taskBoardId: String
    $ticketStageId: String
    $ticketPipelineId: String
    $ticketBoardId: String
    $styles: StylesParams
    $mobileResponsive: Boolean
    $googleCredentials: JSON

    $kbToggle: Boolean
    $publicTaskToggle: Boolean
    $ticketToggle: Boolean
    $taskToggle: Boolean
    $otpConfig: OTPConfigInput
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
      taskStageId: $taskStageId,
      taskPipelineId: $taskPipelineId,
      taskBoardId: $taskBoardId,
      ticketStageId: $ticketStageId,
      ticketPipelineId: $ticketPipelineId,
      ticketBoardId: $ticketBoardId
      styles: $styles
      mobileResponsive: $mobileResponsive
      googleCredentials: $googleCredentials

      kbToggle: $kbToggle,
      publicTaskToggle: $publicTaskToggle,
      ticketToggle: $ticketToggle,
      taskToggle: $taskToggle,
      otpConfig: $otpConfig
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

export default {
  createOrUpdateConfig,
  remove,
  clientPortalUsersInvite,
  clientPortalUsersEdit,
  clientPortalUsersRemove
};

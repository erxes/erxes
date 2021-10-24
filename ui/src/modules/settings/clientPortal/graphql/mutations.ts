import { commonFields } from './queries';

const createOrUpdateConfig = `
  mutation clientPortalConfigUpdate(
    $_id: String
    $name: String
    $description: String
    $logo: String
    $icon: String
    $url: String
    $domain: String
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
    $twilioAccountSid: String
    $twilioAuthToken: String
    $twilioFromNumber: String
  ) {
    clientPortalConfigUpdate(
      _id: $_id,
      name: $name,
      description: $description,
      url: $url,
      logo: $logo,
      icon: $icon,
      domain: $domain,
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
      twilioAccountSid: $twilioAccountSid
      twilioAuthToken: $twilioAuthToken
      twilioFromNumber: $twilioFromNumber
    ) {
      ${commonFields}
    }
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

export default { createOrUpdateConfig, remove };

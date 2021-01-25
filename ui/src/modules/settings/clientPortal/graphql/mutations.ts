const updateConfig = `
  mutation configUpdateClientPortal(
    $name: String!
    $description: String
    $logo: String
    $icon: String
    $knowledgeBaseLabel: String
    $ticketLabel: String
    $taskLabel: String
    $taskStageId: String
    $taskPipelineId: String
    $taskBoardId: String
    $ticketStageId: String
    $ticketPipelineId: String
    $ticketBoardId: String
  ) {
    configUpdateClientPortal(
      name: $name,
      description: $description,
      logo: $logo,
      icon: $icon,
      knowledgeBaseLabel: $knowledgeBaseLabel,
      ticketLabel: $ticketLabel,
      taskLabel: $taskLabel,
      taskStageId: $taskStageId,
      taskPipelineId: $taskPipelineId,
      taskBoardId: $taskBoardId,
      ticketStageId: $ticketStageId,
      ticketPipelineId: $ticketPipelineId,
      ticketBoardId: $ticketBoardId
    )
  }
`;

export default { updateConfig };

const getConfig = `
  query configClientPortal {
    configClientPortal {
      name
      url
      description
      logo
      icon
      knowledgeBaseLabel
      knowledgeBaseTopicId
      ticketLabel
      taskLabel
      taskStageId
      taskPipelineId
      taskBoardId
      ticketStageId
      ticketPipelineId
      ticketBoardId
    }
  }
`;

export default { getConfig };

const pipelinesCopy = `
  mutation pipelinesCopy($_id: String!, $boardId: String, $type: String) {
    pipelinesCopy(_id: $_id, boardId: $boardId, type: $type) {
      _id
      boardId
    }
  }
`;

export default {
  pipelinesCopy
};

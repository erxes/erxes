const pipelinesAdd = `
  mutation dealPipelinesAdd($name: String!, $boardId: String!) {
    dealPipelinesAdd(name: $name, boardId: $boardId) {
      _id
    }
  }
`;

export default {
  pipelinesAdd
};

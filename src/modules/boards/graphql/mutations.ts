const stagesUpdateOrder = `
  mutation stagesUpdateOrder($orders: [OrderItem]) {
    stagesUpdateOrder(orders: $orders) {
      _id
    }
  }
`;

const pipelinesWatch = `
  mutation pipelinesWatch($_id: String!, $isAdd: Boolean, $type: String!) {
    pipelinesWatch(_id: $_id, isAdd: $isAdd, type: $type) {
      _id
      isWatched
    }
  }
`;

const pipelineLabelsAdd = `
  mutation pipelineLabelsAdd($name: String!, $type: String!, $colorCode: String!, $pipelineId: String!) {
    pipelineLabelsAdd(name: $name, colorCode: $colorCode, type: $type, pipelineId: $pipelineId) {
      _id
    }
  }
`;

const pipelineLabelsEdit = `
  mutation pipelineLabelsEdit($_id: String!, $name: String!, $type: String!, $colorCode: String!, $pipelineId: String!) {
    pipelineLabelsEdit(_id: $_id, name: $name, colorCode: $colorCode, type: $type, pipelineId: $pipelineId) {
      _id
    }
  }
`;

const pipelineLabelsRemove = `
  mutation pipelineLabelsRemove($_id: String!) {
    pipelineLabelsRemove(_id: $_id) 
  }
`;

const pipelineLabelsLabel = `
  mutation pipelineLabelsLabel($type: String!, $targetId: String!, $labelIds: [String!]!) {
    pipelineLabelsLabel(type: $type, targetId: $targetId, labelIds: $labelIds)
  }
`;

export default {
  stagesUpdateOrder,
  pipelinesWatch,
  pipelineLabelsLabel,
  pipelineLabelsAdd,
  pipelineLabelsEdit,
  pipelineLabelsRemove
};

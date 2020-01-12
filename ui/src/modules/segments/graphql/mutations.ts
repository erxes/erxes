const segmentsAdd = `
  mutation segmentsAdd(
    $contentType: String!,
    $name: String!,
    $description: String,
    $subOf: String,
    $color: String,
    $connector: String,
    $conditions: [SegmentCondition],
  ) {

    segmentsAdd(
      contentType: $contentType,
      name: $name,
      description: $description,
      subOf: $subOf,
      color: $color,
      connector: $connector,
      conditions: $conditions,
    ) {
      _id
    }
  }
`;

const segmentsEdit = `
  mutation segmentsEdit(
    $_id: String!,
    $name: String!,
    $description: String,
    $subOf: String,
    $color: String,
    $connector: String,
    $conditions: [SegmentCondition],
  ) {

    segmentsEdit(
      _id: $_id,
      name: $name,
      description: $description,
      subOf: $subOf,
      color: $color,
      connector: $connector,
      conditions: $conditions,
    ) {
      _id
    }
  }
`;

const segmentsRemove = `
  mutation segmentsRemove($_id: String!) {
    segmentsRemove(_id: $_id)
  }
`;

export default {
  segmentsAdd,
  segmentsEdit,
  segmentsRemove
};

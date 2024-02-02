const movementAdd = `
mutation AssetMovementAdd($movedAt:String,$description:String,$items: [IMovementItem]) {
  assetMovementAdd(movedAt:$movedAt,description:$description,items: $items)
}

`;
const movementRemove = `
mutation AssetMovementRemove($ids:[String]) {
  assetMovementRemove(ids:$ids)
}
`;

const movementEdit = `
mutation AssetMovementUpdate($_id: String, $doc: JSON) {
  assetMovementUpdate(_id: $_id, doc: $doc)
}
`;

export default { movementAdd, movementRemove, movementEdit };

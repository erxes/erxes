module.exports = [
  {
    name: "deals",
    schema:
      "{ 'userId': { 'type': 'keyword' }, 'stageId': { 'type': 'keyword' }, 'modifiedBy': { 'type': 'keyword' }, 'status': { 'type': 'keyword' }, 'assignedUserIds': { 'type': 'keyword' }, 'watchedUserIds': { 'type': 'keyword' }, 'labelIds': { 'type': 'keyword' }, 'totalAmount': {'type': 'float'}, 'unUsedTotalAmount': {'type': 'float'}, 'bothTotalAmount': {'type': 'float'},'customFieldsData': <nested> }",
    script: ""
  },
  {
    name: "sales_stages",
    schema: "{}",
    script: ""
  },
  {
    name: "sales_pipelines",
    schema: "{}",
    script: ""
  }
];

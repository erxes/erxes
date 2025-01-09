module.exports = [
  {
    name: "tickets",
    schema:
      "{ 'userId': { 'type': 'keyword' }, 'stageId': { 'type': 'keyword' }, 'modifiedBy': { 'type': 'keyword' }, 'status': { 'type': 'keyword' }, 'assignedUserIds': { 'type': 'keyword' }, 'watchedUserIds': { 'type': 'keyword' }, 'labelIds': { 'type': 'keyword' }, 'customFieldsData': <nested> }",
    script: ""
  },
  {
    name: "tickets_stages",
    schema: "{}",
    script: ""
  },
  {
    name: "tickets_pipelines",
    schema: "{}",
    script: ""
  }
];

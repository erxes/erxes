module.exports = [
  {
    name: "tasks",
    schema:
      "{ 'userId': { 'type': 'keyword' }, 'stageId': { 'type': 'keyword' }, 'modifiedBy': { 'type': 'keyword' }, 'status': { 'type': 'keyword' }, 'assignedUserIds': { 'type': 'keyword' }, 'watchedUserIds': { 'type': 'keyword' }, 'labelIds': { 'type': 'keyword' }, 'customFieldsData': <nested> }",
    script: ""
  },
  {
    name: "tasks_stages",
    schema: "{}",
    script: ""
  },
  {
    name: "tasks_pipelines",
    schema: "{}",
    script: ""
  }
];

module.exports = [
  {
    name: 'tickets',
    schema:
      "{ 'userId': { 'type': 'keyword' }, 'stageId': { 'type': 'keyword' }, 'modifiedBy': { 'type': 'keyword' }, 'status': { 'type': 'keyword' }, 'assignedUserIds': { 'type': 'keyword' }, 'watchedUserIds': { 'type': 'keyword' }, 'labelIds': { 'type': 'keyword' }, 'customFieldsData': <nested> }",
    script: '',
  },
  {
    name: 'stages',
    schema: '{}',
    script: '',
  },
  {
    name: 'pipelines',
    schema: '{}',
    script: '',
  },
];

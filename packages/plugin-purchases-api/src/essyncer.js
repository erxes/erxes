module.exports = [
  {
    name: "purchases",
    schema:
      "{ 'userId': { 'type': 'keyword' }, 'stageId': { 'type': 'keyword' }, 'modifiedBy': { 'type': 'keyword' }, 'status': { 'type': 'keyword' }, 'assignedUserIds': { 'type': 'keyword' }, 'watchedUserIds': { 'type': 'keyword' }, 'labelIds': { 'type': 'keyword' }, 'customFieldsData': <nested> }",
    script:
      "if(ns.indexOf('purchases') > -1) { if (doc.productsData) { var productsDataString = JSON.stringify(doc.productsData); var amount = 0; var productsData = JSON.parse(productsDataString); for (var i = 0; i < productsData.length; i++){ amount = amount + productsData[i].amount; } doc.amount = amount; } } "
  },
  {
    name: "purchases_tages",
    schema: "{}",
    script: ""
  },
  {
    name: "purchases_pipelines",
    schema: "{}",
    script: ""
  }
];

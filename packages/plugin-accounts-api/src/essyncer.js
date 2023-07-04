module.exports = [
  {
    name: 'accounts',
    schema:
      "{ 'code': { 'type': 'keyword' }, 'name': { 'type': 'keyword' }, 'status': { 'type': 'keyword' }, 'order': { 'type': 'keyword' }, 'description': { 'type': 'keyword' }, 'tagIds': { 'type': 'keyword' }, 'categoryId': { 'type': 'keyword' }, 'type': { 'type': 'keyword' }, 'taxCode': { 'type': 'keyword' }, 'taxType': { 'type': 'keyword' }, 'vendorId': { 'type': 'keyword' }, 'customFieldsData': <nested>, 'barcodes': { 'type': 'keyword' } }",
    script: ''
  }
];

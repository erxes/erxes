module.exports = [
  {
    name: "products",
    schema: "{ 'code': { 'type': 'keyword' }, 'name': { 'type': 'keyword' }, 'status': { 'type': 'keyword' }, 'order': { 'type': 'keyword' }, 'description': { 'type': 'keyword' }, 'tagIds': { 'type': 'keyword' }, 'categoryId': { 'type': 'keyword' }, 'type': { 'type': 'keyword' }, 'vendorId': { 'type': 'keyword' }, 'customFieldsData': <nested>, 'barcodes': <nested> }",
    script: "",
  }
];
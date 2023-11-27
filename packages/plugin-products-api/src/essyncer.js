module.exports = [
  {
    name: "products",
    schema: "{ 'code': { 'type': 'keyword' }, 'name': { 'type': 'keyword' }, 'shortName': { 'type': 'keyword' }, 'status': { 'type': 'keyword' }, 'barcodeDescription': { 'type': 'keyword' }, 'order': { 'type': 'keyword' }, 'description': { 'type': 'keyword' }, 'tagIds': { 'type': 'keyword' }, 'categoryId': { 'type': 'keyword' }, 'type': { 'type': 'keyword' }, 'unitPrice': { 'type': 'float' }, 'createdAt': { 'type': 'date' }, 'uom': { 'type': 'keyword' }, 'taxCode': { 'type': 'keyword' }, 'taxType': { 'type': 'keyword' }, 'vendorId': { 'type': 'keyword' }, 'sameMasks': { 'type': 'keyword' }, 'customFieldsData': <nested>, 'variants': <nested>, 'attachment': <nested>, 'attachmentMore': <nested>, 'subUoms': <nested>, 'barcodes': { 'type': 'keyword' } }",
    script: "",
  }
];
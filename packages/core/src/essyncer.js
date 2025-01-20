module.exports = [
  {
    name: "tags",
    schema: "{}",
    script: ""
  },
  {
    name: "forms",
    schema: "{}",
    script: ""
  },
  {
    name: "fields",
    schema: "{}",
    script: ""
  },
  {
    name: "fields_groups",
    schema: "{}",
    script: ""
  },
  {
    name: "form_submissions",
    schema: "{ 'value': { 'type': 'text' } }",
    script: ""
  },
  {
    name: "customers",
    schema:
      "{'createdAt': { 'type': 'date' }, 'organizationId': { 'type': 'keyword' }, 'state': { 'type': 'keyword' }, 'primaryEmail': { 'type': 'text', 'analyzer': 'uax_url_email_analyzer', 'fields': { 'keyword' : { 'type':'keyword' } } }, 'primaryPhone': { 'type': 'text', 'fields': { 'raw': { 'type': 'keyword' } } }, 'primaryAddress': { 'type': 'text', 'fields': { 'raw': { 'type': 'keyword' } } }, 'code': { 'type': 'text', 'fields': { 'raw': { 'type': 'keyword' } } }, 'integrationId': { 'type': 'keyword' }, 'relatedIntegrationIds': { 'type': 'keyword' }, 'scopeBrandIds': { 'type': 'keyword' }, 'ownerId': { 'type': 'keyword' }, 'position': { 'type': 'keyword' }, 'leadStatus': { 'type': 'keyword' }, 'tagIds': { 'type': 'keyword' }, 'companyIds': { 'type': 'keyword' }, 'mergedIds': { 'type': 'keyword' }, 'status': { 'type': 'keyword' }, 'emailValidationStatus': { 'type': 'keyword' }, 'customFieldsData': <nested>, 'trackedData': <nested>}",
    script:
      "if (ns.indexOf('customers') > -1) { if (doc.urlVisits) { delete doc.urlVisits } if (doc.trackedDataBackup) { delete doc.trackedDataBackup } if (doc.customFieldsDataBackup) { delete doc.customFieldsDataBackup } if (doc.messengerData) { delete doc.messengerData } if (doc.data) {delete doc.data}}"
  },
  {
    name: "companies",
    schema:
      "{ 'createdAt': { 'type': 'date' }, 'primaryEmail': { 'type': 'text', 'analyzer': 'uax_url_email_analyzer', 'fields': { 'keyword' : { 'type':'keyword' } } }, 'primaryName': { 'type': 'text', 'fields': { 'raw': { 'type': 'keyword' } } }, 'primaryAddress': { 'type': 'text', 'fields': { 'raw': { 'type': 'keyword' } } }, 'scopeBrandIds': { 'type': 'keyword' }, 'plan': { 'type': 'keyword' }, 'industry': { 'type': 'keyword' }, 'parentCompanyId': { 'type': 'keyword' }, 'ownerId': { 'type': 'keyword' }, 'tagIds': { 'type': 'keyword' }, 'mergedIds': { 'type': 'keyword' }, 'status': { 'type': 'keyword' }, 'businessType': { 'type': 'keyword' }, 'customFieldsData' : <nested>, 'trackedData': <nested> }",
    script: ""
  },
  {
    name: "products",
    schema:
      "{ 'code': { 'type': 'keyword' }, 'name': { 'type': 'keyword' }, 'shortName': { 'type': 'keyword' }, 'status': { 'type': 'keyword' }, 'barcodeDescription': { 'type': 'keyword' }, 'order': { 'type': 'keyword' }, 'description': { 'type': 'keyword' }, 'tagIds': { 'type': 'keyword' }, 'categoryId': { 'type': 'keyword' }, 'type': { 'type': 'keyword' }, 'unitPrice': { 'type': 'float' }, 'createdAt': { 'type': 'date' }, 'uom': { 'type': 'keyword' }, 'vendorId': { 'type': 'keyword' }, 'sameMasks': { 'type': 'keyword' }, 'sameDefault': { 'type': 'keyword' }, 'customFieldsData': <nested>, 'attachment': <nested>, 'attachmentMore': <nested>, 'subUoms': <nested>, 'barcodes': { 'type': 'keyword' } }",
    script:
      "if (ns.indexOf('products') > -1) { if (doc.variants) { delete doc.variants }}"
  }
];

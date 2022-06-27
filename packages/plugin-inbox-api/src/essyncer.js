module.exports = [
  {
    name: "conversations",
    schema: "{ 'customFieldsData' : <nested> }",
    script:
      "if(ns.indexOf('conversations') > -1) {var createdAt = JSON.stringify(doc.createdAt); var closedAt = JSON.stringify(doc.closedAt); var updatedAt = JSON.stringify(doc.updatedAt); var firstRespondedDate = JSON.stringify(doc.firstRespondedDate); if(createdAt){ doc.numberCreatedAt = Number(new Date(createdAt.replace(/\"/g,''))); } if(closedAt){ doc.numberClosedAt = Number(new Date(closedAt.replace(/\"/g,''))); } if(updatedAt){ doc.numberUpdatedAt= Number(new Date(updatedAt.replace(/\"/g,''))); } if(firstRespondedDate){ doc.numberFirstRespondedDate= Number(new Date(firstRespondedDate.replace(/\"/g,''))); }}",
  },
  {
    name: "conversation_messages",
    schema: "{}",
    script: "",
  },
  {
    name: "integrations",
    schema: "{}",
    script: "",
  },
  {
    name: "channels",
    schema: "{}",
    script: "",
  }
];

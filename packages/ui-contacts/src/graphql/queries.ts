const contactsLogs = `
  query contactsLogs($action: String, $content: JSON, $contentType: String, $contentId: String){
    contactsLogs(action: $action, content: $content, contentType: $contentType, contentId: $contentId)
  }
`;

export default {
  contactsLogs
};

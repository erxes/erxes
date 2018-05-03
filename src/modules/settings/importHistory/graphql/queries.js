const histories = `
  query importHistories($type: String!, $perPage: Int, $page: Int) {
    importHistories(type: $type, perPage: $perPage, page: $page) {
      _id
      success
      failed
      total
      contentType
      importedDate
      importedUser {
        details {
          fullName
        }
      }
    }
  }
`;

export default {
  histories
};

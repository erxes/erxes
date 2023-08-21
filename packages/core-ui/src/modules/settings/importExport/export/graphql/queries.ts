const exportHistories = `
  query exportHistories($type: String, $perPage: Int, $page: Int) {
    exportHistories(type: $type, perPage: $perPage, page: $page) {
      list {
         _id
        total
        name
        contentType
        date
        percentage
        status
        user {
          details {
            fullName
          }
        }
        exportLink
        uploadType
        errorMsg
        }
      count 
    }
  }
`;

export default {
  exportHistories
};

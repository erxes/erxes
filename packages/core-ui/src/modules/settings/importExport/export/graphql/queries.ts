const exportHistories = `
  query exportHistories($type: String, $perPage: Int, $page: Int) {
    exportHistories(type: $type, perPage: $perPage, page: $page) {
      list {
         _id
        total
        name
        contentType
        date
        status
        user {
          details {
            fullName
          }
        }
        exportLink
        }
      count 
    }
  }
`;

export default {
  exportHistories
};

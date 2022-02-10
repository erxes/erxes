const smsDeliveries = `
  query smsDeliveries($type: String!, $to: String, $page: Int, $perPage: Int) {
    smsDeliveries(type: $type, to: $to, page: $page, perPage: $perPage) {
      list {
        _id
        createdAt
        to
  
        direction
        status
        errorMessages

        engageMessageId
  
        from
        content
        direction
      }

      totalCount
    }
  }
`;

export default { smsDeliveries };

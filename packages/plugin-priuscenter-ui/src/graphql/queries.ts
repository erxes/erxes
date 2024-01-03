const list = `
  query listQuery($page: Int, $perPage: Int) {
    ads(page: $page, perPage: $perPage) {
      _id
      createdAt

      type
      title
      description
      mark
      model
      color
      manufacturedYear

      state
      price

      attachments
      location

      authorName
      authorPhone
      authorEmail
    }
  }
`;

const totalCount = `
  query adsTotalCount{
    adsTotalCount
  }
`;

export default {
  list,
  totalCount
};

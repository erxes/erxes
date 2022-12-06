const list = `
  query listQuery {
    ads {
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

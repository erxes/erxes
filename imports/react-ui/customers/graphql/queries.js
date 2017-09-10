export const customers = `
  query customers {
    customers {
      _id
      name
      email
      phone
      isUser
      integrationId
      createdAt
      messengerData
      twitterData
      facebookData
      tagIds
      internalNotes
      getTags {
        _id
        name
      }
    }
  }
`;

const segment = `
  _id
  name
  description
  subOf
  color
  connector
  conditions
`;

export const segments = `
  query segments {
    segments {
      ${segment}

      getSubSegments {
        ${segment}
      }
    }
  }
`;

export const brands = `
  query brands {
    brands {
      _id
      name
    }
  }
`;

export const tags = `
  query tags($type: String) {
    tags(type: $type) {
      _id
      name
    }
  }
`;

export const totalCustomersCount = `
  query totalCustomersCount {
    totalCustomersCount
  }
`;

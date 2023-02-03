const clientPortalGetTicket = `
  query clientPortalTicket($_id: String!) {
    clientPortalTicket(_id: $_id) {
      _id
      name
      description
      modifiedAt
      status
      priority
      createdAt
      
      stage {
        name
      }

      labels {
        name
        colorCode

      }
    }
  }
`;

const clientPortalTickets = `
  query clientPortalTickets {
    clientPortalTickets {
      _id
      name
      description
      status
      priority
      createdAt

      stage {
        name
      }

      labels {
        name
        colorCode

      }
    }
  }
`;

const clientPortalComments = `
  query clientPortalComments($typeId: String!, $type: String!) {
    clientPortalComments(typeId: $typeId, type: $type) {
      _id
      content
      createdUser 
      createdAt
    }
  }
`

export default {
  clientPortalGetTicket,
  clientPortalTickets,
  clientPortalComments 
};

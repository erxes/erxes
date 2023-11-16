import gql from "graphql-tag"

const logout = gql`
  mutation Mutation {
    logout
  }
`

const markAsRead = gql`
  mutation notificationsMarkAsRead( $_ids: [String], $contentTypeId: String) {
    notificationsMarkAsRead(_ids: $_ids, contentTypeId: $contentTypeId)
  }
`;

const showNotification = gql`
  mutation notificationsShow {
    notificationsShow
  }
`;

export default { 
  logout,
  markAsRead,
  showNotification
}
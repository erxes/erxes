import gql from "graphql-tag"

const notificationSubscription = gql`
	subscription notificationInserted($userId: String) {
		notificationInserted(userId: $userId) {
			_id
			title
			content
		}
  }
`;

const notificationRead = gql`
	subscription notificationRead($userId: String) {
		notificationRead(userId: $userId)
  }
`;

export default { notificationSubscription, notificationRead };

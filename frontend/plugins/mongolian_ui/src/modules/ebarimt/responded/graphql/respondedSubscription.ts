import { gql } from '@apollo/client';

export const EBARIMT_RESPONDED = gql`
	subscription ebarimtResponded($userId: String, $processId: String) {
		ebarimtResponded(userId: $userId, processId: $processId) {
			content
			responseId
			userId
			processId
		}
	}
`;

export default { EBARIMT_RESPONDED };

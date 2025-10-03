// import { useQuery } from '@apollo/client';
// import { GET_MESSENGER_MESSAGES } from '@/inbox/conversation-detail/graphql/queries/getMessengerMessages';
// import { OperationVariables } from '@apollo/client';

// export const useMessengerMessages = (options: OperationVariables) => {
//   const { data, loading, fetchMore } = useQuery(
//     GET_MESSENGER_MESSAGES,
//     options,
//   );

//   const { conversationMessages, conversationMessagesTotalCount } = data || {};

//   const handleFetchMore = (onCompleted?: () => void) => {
//     if (
//       !loading ||
//       conversationMessagesTotalCount > conversationMessages.length
//     ) {
//       fetchMore({
//         variables: {
//           skip: conversationMessages.length,
//           limit: 5,
//         },
//         updateQuery: (prev, { fetchMoreResult }) => {
//           if (!fetchMoreResult) return prev;
//           setTimeout(() => {
//             onCompleted?.();
//           }, 10);
//           return {
//             conversationMessages: [
//               ...fetchMoreResult.conversationMessages,
//               ...prev.conversationMessages,
//             ],
//           };
//         },
//       });
//     }
//   };

//   return {
//     messages: conversationMessages,
//     totalCount: conversationMessagesTotalCount,
//     loading,
//     handleFetchMore,
//   };
// };

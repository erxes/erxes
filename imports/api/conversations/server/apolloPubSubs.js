/*
 * we will use this to call graphql subscripton. After we replace methods with
 * mutations this temp mutations will be deleted
*/

import { mutate } from '../../server/utils';

export const messageInserted = messageId =>
  mutate(
    `
    mutation {
      conversationMessageInserted(_id: "${messageId}")
    }
  `,
  );

export const conversationsChanged = (conversationIds, type) =>
  mutate(
    `
    mutation {
      conversationsChanged(_ids: ${JSON.stringify(conversationIds)}, type: "${type}")
    }
  `,
  );
